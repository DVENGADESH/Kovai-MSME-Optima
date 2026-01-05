import { Zap, Activity, BookOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { EnergyAnalytics } from './EnergyAnalytics';

interface DashboardProps {
    onNavigate: (page: 'bill-scanner' | 'acoustic-diagnostics') => void;
}

export const Dashboard = ({ onNavigate }: DashboardProps) => {
    const { t } = useLanguage();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Energy Analytics Chart - Takes full width on mobile, 2 cols on large screens */}
            <EnergyAnalytics />

            {/* Daily Power Playbook - Mock */}
            <div className="card border-l-4 border-l-brand-blue col-span-1">
                <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="text-brand-blue w-6 h-6" />
                    <h2 className="text-xl font-bold text-white">{t.powerBook}</h2>
                </div>
                <div className="p-4 bg-industrial-900/50 rounded text-industrial-100 h-full">
                    <p className="mb-2 text-sm leading-relaxed">⚡ <strong>Today's Tip:</strong> Shift heavy motor usage to 10 PM - 5 AM to save ₹12/unit.</p>
                    <div className="mt-4 flex flex-col gap-2">
                        <div className="flex justify-between text-xs text-industrial-400">
                            <span>Shift A Efficiency</span>
                            <span className="text-brand-green">92%</span>
                        </div>
                        <div className="w-full bg-industrial-800 rounded-full h-1.5">
                            <div className="bg-brand-green h-1.5 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bill Scanner Card */}
            <button
                onClick={() => onNavigate('bill-scanner')}
                className="card group hover:border-brand-green transition-all text-left"
            >
                <div className="flex items-center justify-between mb-4">
                    <Zap className="w-8 h-8 text-brand-green group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-mono bg-brand-green/20 text-brand-green px-2 py-1 rounded">FEATURE A</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{t.scanBill}</h3>
                <p className="text-industrial-400 text-sm">{t.scanBillDesc}</p>
            </button>

            {/* Acoustic Diagnostics Card */}
            <button
                onClick={() => onNavigate('acoustic-diagnostics')}
                className="card group hover:border-brand-orange transition-all text-left"
            >
                <div className="flex items-center justify-between mb-4">
                    <Activity className="w-8 h-8 text-brand-orange group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-mono bg-brand-orange/20 text-brand-orange px-2 py-1 rounded">FEATURE B</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{t.checkSound}</h3>
                <p className="text-industrial-400 text-sm">{t.checkSoundDesc}</p>
            </button>
        </div>
    );
};
