import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Download, Zap, Database } from 'lucide-react';
import { Button } from './ui/button';
import { generateReport } from '../lib/report-generator';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

const SAMPLE_DATA = [
    { name: 'Week 1', actualCost: 45000, predictedCost: 44000, potentialSavings: 2000 },
    { name: 'Week 2', actualCost: 52000, predictedCost: 48000, potentialSavings: 4000 },
    { name: 'Week 3', actualCost: 49000, predictedCost: 47000, potentialSavings: 3500 },
    { name: 'Week 4', actualCost: 58000, predictedCost: 51000, potentialSavings: 7000 },
];

export const EnergyAnalytics = () => {
    const { user, profile } = useAuth();
    const [chartData, setChartData] = useState<any[]>(SAMPLE_DATA);
    const [isSampleData, setIsSampleData] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                // Fetch last 6 months of energy logs
                // Note: This collection 'energy_logs' needs to be populated by BillScanner or manual entry
                const q = query(
                    collection(db, "users", user.uid, "energy_logs"),
                    orderBy("date", "asc"),
                    limit(6)
                );
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const realData = querySnapshot.docs.map(doc => doc.data());
                    setChartData(realData);
                    setIsSampleData(false);
                } else {
                    // Stay with Sample Data
                    setIsSampleData(true);
                }
            } catch (err) {
                console.error("Analytics fetch error:", err);
                // Fallback to sample
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // Mock report data based on user profile or defaults
    const reportData = {
        companyName: profile?.companyName || "Your Factory",
        totalUnits: isSampleData ? 12500 : chartData.reduce((acc, curr) => acc + (curr.units || 0), 0),
        peakPenalties: isSampleData ? 45000 : 0, // Calculate real if data structure supports
        actionPlan: [
            "Shift 20% load to 10 PM - 5 AM to save ₹15,000.",
            "Inspect Motor #4 for bearing faults (found by Acoustic AI).",
            "Optimize compressor usage during peak hours."
        ]
    };

    const handleDownload = () => {
        generateReport(reportData);
    };

    return (
        <Card className="col-span-1 lg:col-span-2 shadow-lg border-industrial-700 bg-industrial-800/50 backdrop-blur-sm relative overflow-hidden">
            {/* Sample Data Watermark Overlay */}
            {isSampleData && !loading && (
                <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                    <div className="bg-industrial-950/80 backdrop-blur-sm p-6 rounded-xl border border-industrial-700 text-center transform -rotate-6 shadow-2xl">
                        <Database className="w-12 h-12 text-brand-orange mx-auto mb-2 opacity-80" />
                        <h3 className="text-2xl font-bold text-white tracking-widest uppercase opacity-90">Sample Data</h3>
                        <p className="text-industrial-400 text-sm mt-2">Upload a bill to see your real analytics</p>
                    </div>
                </div>
            )}

            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-20">
                <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Zap className="w-5 h-5 text-brand-orange" />
                        Monthly Energy & Savings Analysis
                    </CardTitle>
                    <CardDescription>Real-time cost tracking vs. AI predictions</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={handleDownload} className="gap-2 border-brand-blue/50 text-brand-blue hover:bg-brand-blue/10">
                    <Download className="w-4 h-4" />
                    Download Report
                </Button>
            </CardHeader>
            <CardContent className="relative z-20">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                            <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem' }}
                                itemStyle={{ color: '#F3F4F6' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Line type="monotone" dataKey="actualCost" name="Actual Cost" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="predictedCost" name="Predicted Cost" stroke="#F97316" strokeWidth={2} strokeDasharray="5 5" />
                            <Line type="monotone" dataKey="potentialSavings" name="Potential Savings" stroke="#22C55E" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
