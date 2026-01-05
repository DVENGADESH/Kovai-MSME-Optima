import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './components/theme-provider';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import { Dashboard } from './components/Dashboard';
import { BillScanner } from './components/BillScanner';
import { AcousticDiagnostics } from './components/AcousticDiagnostics';
import Profile from './pages/Profile';
import CompanySettings from './pages/CompanySettings';
import { Factory, Languages, Sun, Moon, Monitor } from 'lucide-react';
import { Button } from './components/ui/button';
import { ProfileDropdown } from './components/ProfileDropdown';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { t, language, setLanguage } = useLanguage();
  // const { logout } = useAuth(); // Logout is now handled in ProfileDropdown
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20 transition-colors duration-300">
      <header className="bg-card border-b border-border p-4 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <Factory className="w-8 h-8 text-brand-orange" />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">{t.title}</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">{t.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'industrial' ? 'light' : theme === 'light' ? 'minimalist' : 'industrial')}
              title="Toggle Theme"
            >
              {theme === 'industrial' ? <Moon className="w-4 h-4" /> : theme === 'light' ? <Sun className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="gap-2"
            >
              <Languages className="w-4 h-4" />
              {language === 'en' ? 'தமிழ்' : 'English'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="gap-2"
            >
              <Languages className="w-4 h-4" />
              {language === 'en' ? 'தமிழ்' : 'English'}
            </Button>

            <ProfileDropdown />
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 pt-6">
        {children}
      </main>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <DashboardWrapper />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/bill-scanner" element={
        <ProtectedRoute>
          <Layout>
            <BillScanner />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/acoustic-diagnostics" element={
        <ProtectedRoute>
          <Layout>
            <AcousticDiagnostics />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <Profile />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/company-settings" element={
        <ProtectedRoute>
          <Layout>
            <CompanySettings />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Wrapper to handle internal dashboard navigation which was state-based in MVP
// Now we use router.
const DashboardWrapper = () => {
  const navigate = useNavigate();
  return <Dashboard onNavigate={(page) => navigate(`/${page}`)} />
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="industrial" storageKey="kovai-ui-theme">
        <AuthProvider>
          <LanguageProvider>
            <AppRoutes />
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
