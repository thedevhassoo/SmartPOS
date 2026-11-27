import { useEffect, useState, type ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Alert, Avatar, Button, CircularProgress, CssBaseline, IconButton, InputAdornment, Paper, TextField, ThemeProvider, createTheme } from '@mui/material';
import { Activity, ArrowRight, Barcode, Boxes, ChartNoAxesCombined, ChevronLeft, CircleHelp, ClipboardList, FileSpreadsheet, History, LayoutDashboard, LogOut, MapPin, Menu, Package, Receipt, RotateCcw, ScanLine, ShieldCheck, ShoppingCart, Sparkles, Store, Tags, Users, Eye, EyeOff } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { api } from './api';
import { Brand } from './components/Brand';
import { UserContext, type Page, type User } from './ui';
import './style.css';
const modules = import.meta.glob<{
    page?: Page;
}>('./features/**/*.tsx', { eager: true });
const authModules = import.meta.glob<{
    Login?: ComponentType<{
        onLogin: (user: User) => void;
    }>;
}>('./features/identity/*.tsx', { eager: true });
const Login = Object.values(authModules).find(module => module.Login)?.Login;
const pages = Object.values(modules).flatMap(module => module.page ? [module.page] : []);
const sections = [
    { title: 'Overview', items: [
            ['dashboard', 'Dashboard', LayoutDashboard], ['pos', 'Point of sale', ScanLine], ['receipts', 'Receipts & history', Receipt]
        ] },
    { title: 'Inventory', items: [
            ['products', 'Products', Package], ['inventory', 'Inventory & batches', Boxes], ['locations', 'Storage locations', MapPin], ['location-management', 'Location management', MapPin], ['stock-reconciliation', 'Stock reconciliation', ClipboardList], ['stock-alerts', 'Stock & expiry alerts', Activity]
        ] },
    { title: 'Operations', items: [
            ['import-preview', 'CSV upload & preview', FileSpreadsheet], ['import-decisions', 'CSV row decisions', FileSpreadsheet], ['import-results', 'CSV import results', FileSpreadsheet], ['offers', 'Scheduled offers', Tags], ['refund-requests', 'Refund requests', RotateCcw], ['refund-management', 'Refund management', History], ['returns', 'Returns & inspection', ShoppingCart]
        ] },
    { title: 'Intelligence & access', items: [['insights', 'AI insights', Sparkles], ['staff', 'Staff accounts', Users]] }
] as const;
const theme = createTheme({
    palette: {
        primary: {
            main: '#FE9F43', contrastText: '#092C4C', dark: '#E98B32', light: '#FFF2E3'
        },
        secondary: { main: '#092C4C' },
        background: { default: '#F8F9FA', paper: '#FFFFFF' },
        text: { primary: '#344054', secondary: '#667085' },
        success: { main: '#218838' }, error: { main: '#DC2626' }, warning: { main: '#B56C06' }
    },
    typography: { fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, sans-serif', button: { textTransform: 'none', fontWeight: 650 } },
    shape: { borderRadius: 8 },
    components: { MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: {
                    minHeight: 38, paddingLeft: 15, paddingRight: 15
                } } }, MuiPaper: { defaultProps: { elevation: 0 } } }
});
function Workspace({ user, onLogout }: {
    user: User;
    onLogout: () => void;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [logoutError, setLogoutError] = useState('');
    const location = useLocation();
    const visible = pages.filter(p => p.roles.includes(user.role));
    const current = visible.find(p => location.pathname === '/' + p.id);
    const landing = visible.find(p => p.id === 'dashboard') ?? visible.find(p => p.id === 'pos') ?? visible[0];
    const role = user.role === 'Owner' ? 'Business owner' : user.role === 'Manager' ? 'Store manager' : 'Cashier';
    return <UserContext.Provider value={user}>
        <div className={'layout' + (collapsed ? ' collapsed' : '')}>
            <aside className="sidebar" aria-label="Main navigation">
                <Brand compact={collapsed}/>
                <nav>
                    {sections.map(section => {
            const items = section.items.filter(([id]) => visible.some(p => p.id === id));
            if (!items.length) {
                return null;
            }
            return <div className="nav-section" key={section.title}>
                        <div className="navlabel">
                            {section.title}
                        </div>
                        {items.map(([id, title, Icon]) => <NavLink key={id} to={'/' + id} className="navitem" title={title} aria-label={title}>
                            <Icon size={18} strokeWidth={1.8}/>
                            <span>
                                {title}
                            </span>
                        </NavLink>)}
                    </div>;
        })}
                </nav>
                <div className="sidebar-footer">
                    <ShieldCheck size={18}/>
                    <span>Role-protected access</span>
                </div>
            </aside>
            <div className="workspace">
                <header className="header">
                    <div className="row header-left">
                        <IconButton aria-label="Toggle navigation" onClick={() => setCollapsed(!collapsed)}>
                            {collapsed ? <Menu size={20}/> : <ChevronLeft size={21}/>}
                        </IconButton>
                        <div className="breadcrumb">Workspace <span>/</span> <strong>
                                {current?.title ?? 'Home'}
                            </strong></div>
                    </div>
                    <div className="row header-right">
                        <span className="store-label"><Store size={16}/> Main store</span>
                        <span className="header-divider"/>
                        <Avatar sx={{
        bgcolor: '#FFF2E3', color: '#945014', width: 35, height: 35, fontSize: 14, fontWeight: 700
    }}>
                            {user.name.slice(0, 2).toUpperCase()}
                        </Avatar>
                        <div className="user-label">
                            <strong>
                                {user.name}
                            </strong>
                            <small>
                                {role}
                            </small>
                        </div>
                        <IconButton
                            title="Sign out"
                            aria-label="Sign out"
                            onClick={async () => {
            try {
                await api('logout');
                onLogout();
            }
            catch (e) {
                setLogoutError((e as Error).message);
            }
        }}
                        >
                            <LogOut size={19}/>
                        </IconButton>
                    </div>
                </header>
                <main className="main">
                    {logoutError && <Alert severity="error" onClose={() => setLogoutError('')}>
                        {logoutError}
                    </Alert>}
                    <Routes>
                        {visible.map(p => <Route
                            key={p.id}
                            path={'/' + p.id}
                            element={<>
                                <div className="pagehead">
                                    <div>
                                        <span className="eyebrow">SMARTPOS WORKSPACE</span>
                                        <h1>
                                            {p.title}
                                        </h1>
                                    </div>
                                    <span className="role-tag">
                                        <ShieldCheck size={15}/>
                                        {role}
                                    </span>
                                </div>
                                <p.component />
                            </>}
                        />)}
                        <Route path="*" element={landing ? <Navigate to={'/' + landing.id} replace/> : <Paper className="panel">
                                <h2>Workspace ready</h2>
                                <p>No feature pages have been integrated for this role yet.</p>
                            </Paper>}/>
                    </Routes>
                    <footer className="workspace-footer">SmartPOS <span>Single-store management</span></footer>
                </main>
            </div>
        </div>
    </UserContext.Provider>;
}
function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        api<User>('me').then(setUser).catch(() => {
        }).finally(() => setLoading(false));
    }, []);
    if (loading) {
        return <div className="loading-screen">
            <Brand />
            <CircularProgress size={26}/>
            <p className="muted">Connecting to SmartPOS...</p>
        </div>;
    }
    return user ? <Workspace user={user} onLogout={() => setUser(null)}/> : Login ? <Login onLogin={setUser}/> : <div className="loading-screen">
        <Brand />
        <p>Foundation initialized. Integrate authentication to sign in.</p>
    </div>;
}
createRoot(document.getElementById('root')!).render(<ThemeProvider theme={theme}>
    <CssBaseline />
    <BrowserRouter>
        <App />
    </BrowserRouter>
</ThemeProvider>);
