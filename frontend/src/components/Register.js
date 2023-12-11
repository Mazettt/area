import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import HeaderComponent from './Header';
import backgroundImage from '../img/BgTop.png';
const Register = () => {
    const [username, setUsername] = useState('test@thomasott.com');
    const [password, setPassword] = useState('test123/');
    const { register, logout, verifyToken } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        const checkToken = async () => {
            if (await verifyToken()) {
                navigate('/');
            }
        };
        checkToken();
    }, [verifyToken, navigate]);
    const handleRegister = async () => {
        try {
            await register(username, password);
            navigate('/');
            console.log('registered!')
        } catch (error) {
            logout();
            console.error('Register failed:', error);
            
        }
    };
    return (
        <div style={{
            backgroundImage: 'linear-gradient(to right, #f3f3f3, #dcdcdc)',
        }}>
            <HeaderComponent isLoggedIn={false} />
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
                    <Typography variant="h4" sx={{ color: '#544d4d', marginBottom: '2rem' }}>
                        S'inscire
                    </Typography>
                    <TextField
                        label="Email"
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        sx={{ marginBottom: '1rem' }}
                    />
                    <TextField
                        label="Mot de passe"
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
                        onClick={handleRegister}
                        sx={{ width: '200px' }}
                    >
                        S'inscire
                    </Button>
                                                      
                    <Typography
                        component={Link}
                        to="/login"
                        color="primary"
                        size="large"
                        align='center'
                        sx={{ width: '200px'}}
                    >
                        Login
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
export default Register;