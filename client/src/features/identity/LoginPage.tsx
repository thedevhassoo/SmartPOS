import { useState } from 'react';
import { Alert, Button, CircularProgress, IconButton, InputAdornment, Paper, TextField } from '@mui/material';
import { ArrowRight, Barcode, Boxes, ChartNoAxesCombined, CircleHelp, Eye, EyeOff } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Brand } from '../../components/Brand';
import { api } from '../../api';
import type { User } from '../../ui';
export function Login({ onLogin }: {
    onLogin: (user: User) => void;
}) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const reduced = useReducedMotion();
    return <main className="login-layout">
        <section className="login-intro">
            <Brand />
            <div className="login-copy">
                <span className="eyebrow"><span className="status-dot"/> SINGLE-STORE OPERATIONS</span>
                <h1>Everything your store needs, in one place.</h1>
                <p>Keep checkout, stock and business decisions connected to the same reliable records.</p>
                <div className="login-feature">
                    <Barcode />
                    <div>
                        <strong>Efficient checkout</strong>
                        <small>Scan, save and complete verified sales.</small>
                    </div>
                </div>
                <div className="login-feature">
                    <Boxes />
                    <div>
                        <strong>Inventory visibility</strong>
                        <small>Manage batches, expiry and storage locations.</small>
                    </div>
                </div>
                <div className="login-feature">
                    <ChartNoAxesCombined />
                    <div>
                        <strong>Evidence-based insights</strong>
                        <small>Understand recorded sales and stock trends.</small>
                    </div>
                </div>
            </div>
            <small className="login-footer">SmartPOS | Authorized store access</small>
        </section>
        <section className="login-form-area">
            <motion.div
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="login-form-wrap"
            >
                <div className="mobile-brand">
                    <Brand />
                </div>
                <span className="eyebrow">SECURE SIGN IN</span>
                <h2>Welcome back</h2>
                <p className="muted">Enter the credentials assigned by your business owner.</p>
                <Paper className="login-card">
                    <form onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError('');
            try {
                onLogin(await api<User>('login', { username, password }));
            }
            catch (e) {
                setError((e as Error).message);
            }
            finally {
                setBusy(false);
            }
        }}>
                        <div className="login-fields">
                            <TextField
                                label="Username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                                autoComplete="username"
                                fullWidth
                                autoFocus
                            />
                            <TextField
                                label="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                type={showPassword ? 'text' : 'password'}
                                required
                                autoComplete="current-password"
                                fullWidth
                                slotProps={{ input: { endAdornment: <InputAdornment position="end">
                                    <IconButton
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <EyeOff size={19}/> : <Eye size={19}/>}
                                    </IconButton>
                                </InputAdornment> } }}
                            />
                            {error && <Alert severity="error">
                                {error}
                            </Alert>}
                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                type="submit"
                                disabled={busy}
                                endIcon={busy ? <CircularProgress size={17} color="inherit"/> : <ArrowRight size={18}/>}
                            >
                                {busy ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </div>
                    </form>
                </Paper>
                <div className="help-note"><CircleHelp size={17}/> Need access? Contact your business owner.</div>
            </motion.div>
        </section>
    </main>;
}
