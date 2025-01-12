import React from 'react';
import {Route, Routes, useLocation, Navigate} from 'react-router-dom';

// Screens
import HomeScreen from "./Screens/HomeScreen";
import LoginScreen from "./Screens/Auth/LoginScreen";
import RegisterScreen from "./Screens/Auth/RegisterScreen";
import NotFoundScreen from "./Screens/NotFoundScreen";
import StoreScreen from "./Screens/StoreScreen";
import PersonScreen from "./Screens/PersonScreen"
import OrderScreen from "./Screens/OrderScreen";
import WorkScreen from "./Screens/WorkScreen";
import MaterialScreen from "./Screens/MaterialScreen";
import MaterialAddScreen from "./Screens/MaterialAddScreen";
import WorkCreateScreen from "./Screens/WorkCreateScreen";
import WorkStatus from "./Screens/WorkStatus";
import OrderCreateScreen from "./Screens/OrderCreateScreen";
import OrderStatus from "./Screens/OrderStatus";
import CompanySettingsScreen from "./Screens/CompanySettingsScreen";
import PersonCreate from "./Screens/PersonCreate";

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
                    <Route path="/company-settings" element={<CompanySettingsScreen/>}/>

                    {/* Auth */}
                    <Route path="/login" element={<LoginScreen/>}/>
                    <Route path="/register" element={<RegisterScreen/>}/>

                    {/* Store & Material */}
                    <Route path="/store" element={<StoreScreen/>}/>
                    <Route path="/material" element={<MaterialScreen/>}/>
                    <Route path="/material-add" element={<MaterialAddScreen/>}/>

                    {/* Person */}
                    <Route path="/person" element={<PersonScreen/>}/>
                    <Route path="/person-create" element={<PersonCreate/>}/>

                    {/* Order & Work */}
                    <Route path="/order" element={<OrderScreen/>}/>
                    <Route path="/order-create" element={<OrderCreateScreen/>}/>
                    <Route path="/order-status" element={<OrderStatus/>}/>
                    <Route path="/work" element={<WorkScreen/>}/>
                    <Route path="/work-create" element={<WorkCreateScreen/>}/>
                    <Route path="/work-status" element={<WorkStatus/>}/>


                    <Route path="*" element={<Navigate to="/not-found" replace/>}/>
                    <Route path="/not-found" element={<NotFoundScreen/>}/>
                </Routes>
            </div>
        </div>
    );
}

export default App;
