import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/auth', { replace: true });
        }
    }, [isAuthenticated, loading, navigate]);

    if (loading) {
        return (
            <div className="loading_container">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>
        );
    }

    return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;
