import React, {createContext, useContext, useState, useEffect} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import axios from 'axios';
import {toast} from 'react-toastify';

interface AuthContextProps {
    isAuthenticated: boolean;
    loading: boolean;
    user: any | null;
    login: (token: string, user: any) => void;
    logout: () => void;
    setIsAuthenticated: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextProps>({
    isAuthenticated: false,
    loading: true,
    user: null,
    login: () => {
    },
    logout: () => {
    },
    setIsAuthenticated: () => {
    },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<any | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            setIsAuthenticated(false);
            setUser(null);
            setLoading(false);
            if (location.pathname !== '/auth') {
                navigate('/auth');
            }
            return;
        }

        try {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setIsAuthenticated(true);
            if (location.pathname === '/auth') {
                navigate('/');
            }
        } catch (error) {
            console.error('Auth check error:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            setUser(null);
            if (location.pathname !== '/auth') {
                navigate('/auth');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = (token: string, userData: any) => {
        try {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setIsAuthenticated(true);
            setUser(userData);
            navigate('/', {replace: true});
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Giriş işlemi sırasında bir hata oluştu');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setIsAuthenticated(false);
        setUser(null);
        navigate('/auth', {replace: true});
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                loading,
                user,
                login,
                logout,
                setIsAuthenticated,
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};