import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { motion } from "framer-motion";
import { Factory, Loader2 } from "lucide-react";
import { animations } from "../lib/animations";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // New fields
    const [fullName, setFullName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [industryType, setIndustryType] = useState("Textile");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { refreshProfile } = useAuth();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const cred = await createUserWithEmailAndPassword(auth, email, password);

                // Create user profile in Firestore
                await setDoc(doc(db, "users", cred.user.uid), {
                    uid: cred.user.uid,
                    email,
                    fullName,
                    companyName,
                    industryType,
                    createdAt: new Date().toISOString()
                });

                await refreshProfile();
            }
            navigate("/");
        } catch (err: any) {
            setError(err.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-industrial-900 text-white overflow-hidden">
            {/* Visual Side */}
            <div className="relative hidden lg:flex flex-col justify-center items-center bg-industrial-950 p-10">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-orange/20 via-industrial-950 to-industrial-950 opacity-40" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="relative z-10 text-center"
                >
                    <Factory className="w-24 h-24 text-brand-orange mx-auto mb-6" />
                    <h1 className="text-5xl font-bold tracking-tighter mb-4">Kovai MSME-Optima</h1>
                    <p className="text-xl text-industrial-400 max-w-md mx-auto">
                        Next-gen industrial intelligence for Coimbatore's textile and engineering sectors.
                    </p>
                </motion.div>
            </div>

            {/* Form Side */}
            <div className="flex items-center justify-center p-8 bg-industrial-900 overflow-y-auto">
                <motion.div
                    variants={animations.slideUp as any}
                    initial="hidden"
                    animate="show"
                    className="w-full max-w-md"
                >
                    <Card className="border-industrial-700 bg-industrial-800 shadow-2xl">
                        <CardHeader>
                            <CardTitle className="text-2xl text-white">{isLogin ? "Welcome Back" : "Register Factory"}</CardTitle>
                            <CardDescription className="text-industrial-400">
                                {isLogin ? "Enter your credentials to access the dashboard" : "Join the industrial network"}
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleAuth}>
                            <CardContent className="space-y-4">
                                {!isLogin && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName" className="text-industrial-200">Full Name</Label>
                                            <Input
                                                id="fullName"
                                                className="bg-industrial-900 border-industrial-600 text-white"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="companyName" className="text-industrial-200">Company Name</Label>
                                            <Input
                                                id="companyName"
                                                className="bg-industrial-900 border-industrial-600 text-white"
                                                value={companyName}
                                                onChange={(e) => setCompanyName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="industryType" className="text-industrial-200">Industry Type</Label>
                                            <select
                                                id="industryType"
                                                className="w-full flex h-10 rounded-md border border-industrial-600 bg-industrial-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2 focus:ring-offset-industrial-900"
                                                value={industryType}
                                                onChange={(e) => setIndustryType(e.target.value)}
                                            >
                                                <option value="Textile">Textile</option>
                                                <option value="Pump">Motor & Pump</option>
                                                <option value="Foundry">Foundry</option>
                                                <option value="Other">Other Engineering</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-industrial-200">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="factory@example.com"
                                        className="bg-industrial-900 border-industrial-600 text-white placeholder:text-industrial-500"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-industrial-200">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        className="bg-industrial-900 border-industrial-600 text-white"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                {error && <p className="text-red-400 text-sm">{error}</p>}
                            </CardContent>
                            <CardFooter className="flex flex-col gap-4">
                                <Button
                                    className="w-full bg-brand-orange hover:bg-orange-600 text-white font-bold"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                                    {isLogin ? "Sign In" : "Register Factory"}
                                </Button>
                                <div className="text-center text-sm">
                                    <span className="text-industrial-400">
                                        {isLogin ? "New user? " : "Already have an account? "}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setIsLogin(!isLogin)}
                                        className="text-brand-blue hover:underline font-medium"
                                    >
                                        {isLogin ? "Register Now" : "Sign In"}
                                    </button>
                                </div>
                            </CardFooter>
                        </form>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
