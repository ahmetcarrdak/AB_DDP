import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    // Eğer yükleme durumundaysa, bir yükleme göstergesi göster
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

    // Eğer kimlik doğrulaması yapılmadıysa, auth sayfasına yönlendir
    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }  // Bunu kaldırınca sürekli autha atma sorunu çözülüyor ama aslen sorun çözülmedi

    // Kimlik doğrulaması yapılmışsa, çocuk bileşenleri render et
    return <>{children}</>;
};

export default ProtectedRoute;