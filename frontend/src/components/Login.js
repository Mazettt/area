import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import backgroundImage from '../img/BgTop.png';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useSettings } from '../SettingsContext';
import { useTheme } from '../themeContext';
import Alert from '@mui/material/Alert';

export const LoginGithubCallback = () => {
    const navigate = useNavigate();
    const { loginGithub } = useAuth();
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    useEffect(() => {
        const handleGithubCallback = async () => {
            try {
                await loginGithub(code);
                navigate('/');
            } catch (error) {
                console.error('Github callback failed:', error);
                navigate('/login');
            }
        };
        handleGithubCallback();
    }, [code]);

    return null;
};

const Login = () => {
    const { t } = useSettings();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, logout, verifyToken } = useAuth();
    const { mainTheme } = useTheme();
    const navigate = useNavigate();
    const [error, setError] = useState("");

    useEffect(() => {
        const checkToken = async () => {
            if (await verifyToken()) {
                navigate('/');
            }
        };
        checkToken();
    }, [verifyToken, navigate]);

    const handleLogin = async () => {
        try {
            await login(username, password);
            navigate('/');
        } catch (error) {
            setError(t("Invalid username or password"));
            logout();
            console.error('Login failed:', error);
        }
    };

    const handleLoginGithub = async () => {
        const url = 'https://github.com/login/oauth/authorize';
        const params = {
            client_id: process.env.REACT_APP_GITHUB_CLIENT_ID,
            redirect_uri: `${process.env.REACT_APP_PUBLIC_URL}/login/github/callback`,
            scope: 'user repo',
        };
        const query = Object.keys(params).map((key) => `${key}=${encodeURIComponent(params[key])}`).join('&');

        window.location.href = `${url}?${query}`;
    }

    return (
        <div style={{
            backgroundImage: 'linear-gradient(to right, #f3f3f3, #dcdcdc)',
        }}>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    height: '100vh',
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: mainTheme.palette.mainBackground.main,
                    backgroundPosition: 'right bottom',
                    backgroundSize: '60% 100%',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        width: '50%',
                        height: '100%',
                        padding: '0 5%',
                    }}
                >
                    <Typography variant="h4" sx={{ color: mainTheme.palette.SwitchStyle.main, marginBottom: '2rem' }}>
                        {t("Login")}
                    </Typography>
                    {error ? <Alert severity="warning">{error}</Alert> : ""}
                    <TextField
                        label={t("Email")}
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        sx={{ marginBottom: '1rem' }}
                    />
                    <TextField
                        label={t("Password")}
                        variant="outlined"
                        margin="normal"
                        type="password"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{ marginBottom: '2rem' }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleLogin}
                        sx={{ width: '30%', minHeight: '45px', minWidth: '120px' }}
                    >
                        {t("Login")}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={<GitHubIcon />}
                        onClick={handleLoginGithub}
                        sx={{ width: '30%', minHeight: '45px', minWidth: '120px', marginTop: '1rem' }}
                    >
                        {t("Login with Github")}
                    </Button>
                    <Typography
                        component={Link}
                        to="/register"
                        color="primary"
                        size="large"
                        align='center'
                        sx={{ marginTop: '1rem' }}
                    >
                        {t("Don't have an account?")}
                    </Typography>
                </div>
                <div
                    style={{
                        width: '50%',
                        height: '100vh',
                    }}
                />
            </div>
        </div>
    );
};

export default Login;
