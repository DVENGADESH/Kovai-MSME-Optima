import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { User, Mail, Calendar, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { deleteUser } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Profile() {
    const { user, profile } = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    if (!user) return null;

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            // 1. Delete Firestore User Doc
            await deleteDoc(doc(db, "users", user.uid));

            // 2. Delete Firestore Company Doc
            await deleteDoc(doc(db, "companies", user.uid));

            // 3. Delete Authentication User
            // Note: This requires recent authentication. If failed, might need re-auth loop.
            // For this implementation, we assume session is fresh enough or catch error.
            if (user) {
                await deleteUser(user);
                // Auth state listener in App will redirect to Login
            }
        } catch (error) {
            console.error("Delete Account Error:", error);
            alert("Failed to delete account. You may need to re-login and try again.");
            setIsDeleting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-6">User Profile</h1>

            <Card className="border-industrial-700 bg-industrial-800/50 backdrop-blur-sm mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-brand-blue" />
                        Personal Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-industrial-400 font-medium uppercase">Full Name</span>
                        <div className="text-lg font-semibold text-white">{profile?.fullName || "Not set"}</div>
                    </div>

                    <div className="flex flex-col gap-1 border-t border-industrial-700/50 pt-3">
                        <span className="text-sm text-industrial-400 font-medium uppercase flex items-center gap-2">
                            <Mail className="w-3 h-3" /> Email Address
                        </span>
                        <div className="text-lg text-white">{user.email}</div>
                    </div>

                    <div className="flex flex-col gap-1 border-t border-industrial-700/50 pt-3">
                        <span className="text-sm text-industrial-400 font-medium uppercase flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> Member Since
                        </span>
                        {/* createdAt comes from Firestore as string */}
                        <div className="text-lg text-white">
                            {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "Unknown"}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-red-900/30 bg-red-950/10">
                <CardHeader>
                    <CardTitle className="text-red-500 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription className="text-red-400/70">
                        Permanent actions for your account.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="justify-between border-t border-red-900/30 pt-4">
                    <div className="text-sm text-industrial-400 max-w-xs">
                        Permanently removes your profile, company data, and all analysis history.
                    </div>

                    {!confirmDelete ? (
                        <Button
                            variant="destructive"
                            onClick={() => setConfirmDelete(true)}
                        >
                            Delete Account
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5">
                            <span className="text-sm text-red-300 font-bold">Are you sure?</span>
                            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                            >
                                {isDeleting ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                Confirm Delete
                            </Button>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
