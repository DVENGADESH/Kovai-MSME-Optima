import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";

export const ProfileDropdown = () => {
    const { user, profile, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (!user) return null;

    // Get initials for avatar
    const getInitials = () => {
        if (profile?.fullName) {
            return profile.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        }
        return user.email?.substring(0, 2).toUpperCase() || "U";
    };

    return (
        <div className="relative z-50">
            <Button
                variant="ghost"
                className="flex items-center gap-2 p-1 hover:bg-industrial-800 rounded-full pr-3"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-industrial-700">
                    {getInitials()}
                </div>
                <ChevronDown className="w-4 h-4 text-industrial-400" />
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 mt-2 w-64 bg-industrial-900 border border-industrial-700 rounded-lg shadow-2xl z-50 overflow-hidden"
                        >
                            <div className="p-4 border-b border-industrial-800 bg-industrial-950/50">
                                <p className="font-semibold text-white truncate">{profile?.fullName || "User"}</p>
                                <p className="text-xs text-industrial-400 truncate">{profile?.companyName || user.email}</p>
                                <div className="mt-2 text-xs bg-industrial-800 text-brand-blue px-2 py-1 rounded w-fit">
                                    {profile?.industryType || "Industrial"} Solution
                                </div>
                            </div>

                            <div className="p-1">
                                <Link to="/profile">
                                    <Button variant="ghost" className="w-full justify-start text-sm font-normal text-industrial-300 hover:text-white hover:bg-industrial-800" onClick={() => setIsOpen(false)}>
                                        <User className="w-4 h-4 mr-2" />
                                        View Profile
                                    </Button>
                                </Link>
                                <Link to="/company-settings">
                                    <Button variant="ghost" className="w-full justify-start text-sm font-normal text-industrial-300 hover:text-white hover:bg-industrial-800" onClick={() => setIsOpen(false)}>
                                        <Settings className="w-4 h-4 mr-2" />
                                        Company Settings
                                    </Button>
                                </Link>
                            </div>

                            <div className="p-1 border-t border-industrial-800">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-sm font-normal text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                    onClick={() => {
                                        logout();
                                        setIsOpen(false);
                                    }}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
