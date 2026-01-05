import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Loader2, Save, Building2 } from "lucide-react";

export default function CompanySettings() {
    const { user, profile, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form Fields
    const [companyData, setCompanyData] = useState({
        companyName: "",
        gstin: "",
        industryType: "Textile",
        machineCount: "",
        shiftTimings: "General (9AM - 6PM)"
    });

    useEffect(() => {
        const fetchCompany = async () => {
            if (!user) return;
            setLoading(true);
            try {
                // Pre-fill from Profile if available, or fetch specific company doc
                // For now, we store basic company info in 'users' but requested 'companies' collection too.
                // We'll sync them or just use 'companies'. Let's use 'companies' as requested.
                const docRef = doc(db, "companies", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setCompanyData(docSnap.data() as any);
                } else if (profile) {
                    // Fallback to Profile data for initial population
                    setCompanyData(prev => ({
                        ...prev,
                        companyName: profile.companyName || "",
                        industryType: profile.industryType || "Textile"
                    }));
                }
            } catch (err) {
                console.error("Failed to load company settings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCompany();
    }, [user, profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setCompanyData({ ...companyData, [e.target.id]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSaving(true);
        setMessage(null);

        try {
            // Save to 'companies' collection
            await setDoc(doc(db, "companies", user.uid), {
                uid: user.uid,
                ...companyData,
                updatedAt: new Date().toISOString()
            });

            // Sync critical fields back to 'users' profile for easy access
            await setDoc(doc(db, "users", user.uid), {
                companyName: companyData.companyName,
                industryType: companyData.industryType
            }, { merge: true });

            await refreshProfile();
            setMessage({ type: 'success', text: "Company settings saved successfully." });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || "Failed to save settings." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin w-8 h-8 text-brand-orange" /></div>;
    }

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="mb-6 flex items-center gap-3">
                <div className="p-3 bg-industrial-800 rounded-lg border border-industrial-700">
                    <Building2 className="w-8 h-8 text-brand-blue" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Company Settings</h1>
                    <p className="text-industrial-400">Manage your industrial profile and configurations</p>
                </div>
            </div>

            <Card className="border-industrial-700 bg-industrial-800/50 backdrop-blur-sm shadow-xl">
                <CardHeader>
                    <CardTitle>Business Profile</CardTitle>
                    <CardDescription>This information is used to calibrate AI recommendations.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSave}>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="companyName">Company Name</Label>
                                <Input id="companyName" value={companyData.companyName} onChange={handleChange} required className="bg-industrial-900 border-industrial-700" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gstin">GSTIN (Optional)</Label>
                                <Input id="gstin" value={companyData.gstin} onChange={handleChange} placeholder="33AAAAA0000A1Z5" className="bg-industrial-900 border-industrial-700" />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="industryType">Industry Type</Label>
                                <select
                                    id="industryType"
                                    value={companyData.industryType}
                                    onChange={handleChange}
                                    className="w-full h-10 rounded-md border border-industrial-700 bg-industrial-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                                >
                                    <option value="Textile">Textile / Spinning Mill</option>
                                    <option value="Pump">Motor & Pump Manufacturing</option>
                                    <option value="Foundry">Foundry & Casting</option>
                                    <option value="AutoComponents">Auto Components</option>
                                    <option value="Other">Other Engineering</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="machineCount">Number of Major Machines</Label>
                                <Input id="machineCount" type="number" value={companyData.machineCount} onChange={handleChange} placeholder="e.g. 15" className="bg-industrial-900 border-industrial-700" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="shiftTimings">Shift Operation Model</Label>
                            <select
                                id="shiftTimings"
                                value={companyData.shiftTimings}
                                onChange={handleChange}
                                className="w-full h-10 rounded-md border border-industrial-700 bg-industrial-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                            >
                                <option value="General (9AM - 6PM)">General Shift (9 AM - 6 PM)</option>
                                <option value="Two Shifts (6AM - 10PM)">Two Shifts (6 AM - 10 PM)</option>
                                <option value="Three Shifts (24x7)">Three Shifts (24x7 Continuous)</option>
                            </select>
                        </div>

                        {message && (
                            <div className={`p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                {message.text}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-4 border-t border-industrial-700 pt-4">
                        <div className="flex-1 text-xs text-industrial-500">
                            Changes to industry type will update your AI analysis model immediately.
                        </div>
                        <Button type="submit" disabled={saving} className="bg-brand-orange hover:bg-orange-600">
                            {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Settings
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
