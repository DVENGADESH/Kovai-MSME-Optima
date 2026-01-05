import { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertTriangle, Loader2, Monitor } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { analyzeBill, type BillAnalysisResult } from '../lib/gemini';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";


export const BillScanner = () => {
    const { t, language } = useLanguage();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<BillAnalysisResult | null>(null);
    const [comparison, setComparison] = useState<{ trend: string; percent: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
            setResult(null);
            setComparison(null);
            setError(null);
        }
    };

    const handleScan = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        try {
            // 1. Analyze with Gemini
            const data = await analyzeBill(file, language);
            setResult(data);

            // 2. Compare with Firestore History
            if (auth.currentUser) {
                const q = query(
                    collection(db, "users", auth.currentUser.uid, "bills"),
                    orderBy("date", "desc"),
                    limit(1)
                );
                const querySnapshot = await getDocs(q);
                const currentUnits = parseFloat(data.totalConsumption.replace(/,/g, ''));

                if (!querySnapshot.empty) {
                    const lastBill = querySnapshot.docs[0].data();
                    const lastUnits = lastBill.totalUnits || 10000;
                    const diff = currentUnits - lastUnits;
                    const percent = ((diff / lastUnits) * 100).toFixed(1);
                    setComparison({
                        trend: diff > 0 ? "Increased" : "Decreased",
                        percent: `${Math.abs(parseFloat(percent))}%`
                    });
                } else {
                    // Compare with Avg
                    const avg = 10000;
                    const diff = currentUnits - avg;
                    const percent = ((diff / avg) * 100).toFixed(1);
                    setComparison({
                        trend: diff > 0 ? "Above Avg" : "Below Avg",
                        percent: `${Math.abs(parseFloat(percent))}%`
                    });
                }
            }

        } catch (err: any) {
            setError(err.message || 'Scan failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-6rem)] grid lg:grid-cols-2 gap-8">
            {/* Left Col: Upload & Preview */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2">
                    <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => window.history.back()}>
                        <span className="text-brand-blue hover:underline">← {t.dashboard}</span>
                    </Button>
                </div>

                <Card className="flex-1 flex flex-col items-center justify-center border-dashed border-2 bg-industrial-900/50 backdrop-blur-sm relative overflow-hidden group">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    {preview ? (
                        <div className="relative w-full h-full p-4">
                            <img src={preview} alt="Bill Preview" className="w-full h-full object-contain rounded-md shadow-2xl" />
                            <Button
                                size="icon"
                                variant="destructive"
                                className="absolute top-6 right-6"
                                onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                            >
                                ✕
                            </Button>
                        </div>
                    ) : (
                        <div
                            className="text-center p-12 cursor-pointer transition-transform group-hover:scale-105"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Upload className="w-10 h-10 text-brand-green" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{t.scanBill}</h3>
                            <p className="text-muted-foreground">{t.scanBillDesc}</p>
                        </div>
                    )}
                </Card>

                {/* Progress Overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-industrial-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-xl p-8">
                        <Loader2 className="w-12 h-12 text-brand-orange animate-spin mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Calculating TANGEDCO 2026 Savings... / மின்சார சேமிப்பை கணக்கிடுகிறது...</h3>
                        <div className="w-64 h-2 bg-industrial-800 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-orange animate-[loading_2s_ease-in-out_infinite] w-full origin-left-right" />
                        </div>
                        <p className="text-industrial-400 text-sm mt-4 text-center">Identifying 2026 TANGEDCO Tariffs & Calculating Savings</p>
                    </div>
                )}

                {preview && !result && !loading && (
                    <Button
                        size="lg"
                        className="w-full font-bold text-lg bg-brand-green hover:bg-green-600"
                        onClick={handleScan}
                        disabled={loading}
                    >
                        {t.scanBill}
                    </Button>
                )}

                {error && (
                    <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 font-semibold">
                            <AlertTriangle className="w-5 h-5" />
                            <span>Analysis Failed / பகுப்பாய்வு தோல்வியடைந்தது</span>
                        </div>
                        <p className="text-sm opacity-90">
                            We could not process the image. Please try again or check your internet.
                        </p>
                        <p className="text-sm opacity-80 font-tamil">
                            படத்தை செயலாக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.
                        </p>
                        <div className="text-xs font-mono mt-1 opacity-50 select-all">
                            Details: {error}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Col: Analysis Results */}
            <div className="overflow-y-auto pr-2">
                {result ? (
                    <div className="space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-500">
                        <h2 className="text-3xl font-bold tracking-tight mb-6">Analysis Report</h2>

                        <Card className="overflow-hidden border-industrial-700 bg-industrial-800">
                            <CardHeader className="bg-industrial-900 border-b border-industrial-700">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="flex items-center gap-2">
                                        <Monitor className="w-5 h-5 text-brand-blue" />
                                        Bill Breakdown
                                    </CardTitle>
                                    {comparison && (
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${comparison.trend.includes('Increase') || comparison.trend.includes('Above') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                            {comparison.trend} by {comparison.percent}
                                        </span>
                                    )}
                                </div>
                                <CardDescription>TANGEDCO 2026 Analysis</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="w-full overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-industrial-950 text-industrial-400 uppercase text-xs">
                                            <tr>
                                                <th className="px-6 py-3 font-medium">Metric / <span className="text-xs font-normal opacity-70">அளவுரு</span></th>
                                                <th className="px-6 py-3 font-medium text-right">Value / <span className="text-xs font-normal opacity-70">மதிப்பு</span></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-industrial-700 text-industrial-100 font-medium">
                                            <tr className="hover:bg-industrial-700/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>{t.totalConsumption}</div>
                                                    <div className="text-xs text-industrial-500">மொத்த நுகர்வு</div>
                                                </td>
                                                <td className="px-6 py-4 text-right tabular-nums">{result.totalConsumption}</td>
                                            </tr>
                                            <tr className="hover:bg-industrial-700/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>{t.fixedCharges}</div>
                                                    <div className="text-xs text-industrial-500">நிலையான கட்டணம்</div>
                                                </td>
                                                <td className="px-6 py-4 text-right tabular-nums">{result.fixedCharges}</td>
                                            </tr>
                                            <tr className="hover:bg-industrial-700/50 transition-colors bg-brand-orange/5">
                                                <td className="px-6 py-4 text-brand-orange">
                                                    <div>{t.peakCharges}</div>
                                                    <div className="text-xs opacity-70">பீக் ஹவர் கட்டணம்</div>
                                                </td>
                                                <td className="px-6 py-4 text-right tabular-nums text-brand-orange">{result.peakCharges}</td>
                                            </tr>
                                            <tr className="hover:bg-industrial-700/50 transition-colors bg-brand-green/10 border-t-2 border-industrial-600">
                                                <td className="px-6 py-4 text-brand-green font-bold text-lg">
                                                    <div>{t.savingsPot}</div>
                                                    <div className="text-xs opacity-70">சேமிப்பு வாய்ப்பு</div>
                                                </td>
                                                <td className="px-6 py-4 text-right tabular-nums text-brand-green font-bold text-lg">{result.savingsPotential}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Strategic Recommendations</CardTitle>
                                <CardDescription>AI-generated shifts for cost reduction</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {result.recommendations.map((rec, idx) => (
                                    <div key={idx} className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="mt-1">
                                            <CheckCircle className="w-5 h-5 text-brand-blue" />
                                        </div>
                                        <p className="text-sm leading-relaxed">{rec}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
                        {/* Monitor icon removed to avoid import error if needed, or included if installed */}
                        <p>Upload a bill to generate TANGEDCO analysis</p>
                    </div>
                )}
            </div>
        </div>
    );
};
