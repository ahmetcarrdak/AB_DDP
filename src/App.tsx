import React from 'react';
import {Route, Routes, useLocation, Navigate} from 'react-router-dom';

// Screens
import HomeScreen from "./Screens/HomeScreen";
import LoginScreen from "./Screens/Auth/LoginScreen";
import RegisterScreen from "./Screens/Auth/RegisterScreen";
import NotFoundScreen from "./Screens/NotFoundScreen";
import StoreScreen from "./Screens/StoreScreen";

// Components
import MenuComponent from "./Components/MenuComponent";

function App() {
    const location = useLocation();
    const hideMenuRoutes = ["/login", "/register", "/not-found"];
    return (
        <div className="App">
            {!hideMenuRoutes.includes(location.pathname) && (
                <div className="menu">
                    <MenuComponent/>
                </div>
            )}
            <div className="body">
                <Routes>
                    <Route path="/" element={<HomeScreen/>}/>
                    <Route path="/login" element={<LoginScreen/>}/>
                    <Route path="/register" element={<RegisterScreen/>}/>
                    <Route path="/store" element={<StoreScreen/>}/>


                    <Route path="*" element={<Navigate to="/not-found" replace/>}/>
                    <Route path="/not-found" element={<NotFoundScreen/>}/>
                </Routes>
            </div>
        </div>
    );
}

export default App;
