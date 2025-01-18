import React, { useState } from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Screens
import HomeScreen from "./Screens/HomeScreen";
import LoginScreen from "./Screens/Auth/LoginScreen";
import RegisterScreen from "./Screens/Auth/RegisterScreen";
import NotFoundScreen from "./Screens/NotFoundScreen";
import StoreScreen from "./Screens/StoreScreen";
import PersonScreen from "./Screens/PersonScreen";
import OrderScreen from "./Screens/OrderScreen";
import WorkScreen from "./Screens/WorkScreen";
import MaterialAddScreen from "./Screens/Create/MaterialAddScreen";
import MaterialUpdateById from "./Screens/Update/MaterialUpdateById";
import MaterialUpdate from "./Screens/Update/MaterialUpdate";
import WorkCreateScreen from "./Screens/Create/WorkCreateScreen";
import WorkStatus from "./Screens/Status/WorkStatus";
import OrderCreateScreen from "./Screens/Create/OrderCreateScreen";
import OrderStatus from "./Screens/Status/OrderStatus";
import CompanySettingsScreen from "./Screens/CompanySettingsScreen";
import PersonCreate from "./Screens/Create/PersonCreateScreen";
import PersonUpdateById from "./Screens/Update/PersonUpdateById";
import PersonUpdate from "./Screens/Update/PersonUpdate";

// Components
import MenuComponent from "./Components/MenuComponent";

function App() {
  const location = useLocation();
  const hideMenuRoutes = ["/login", "/register", "/not-found"];
  return (
    <>
      <div className="App">
        {!hideMenuRoutes.includes(location.pathname) && (
          <div className="menu">
            <MenuComponent />
          </div>
        )}
        <div className="body">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route
              path="/company-settings"
              element={<CompanySettingsScreen />}
            />

            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />

            <Route path="/store" element={<StoreScreen />} />
            <Route path="/material-add" element={<MaterialAddScreen />} />
            <Route
              path="/store-update-material/:id"
              element={<MaterialUpdateById />}
            />
            <Route path="/material-update" element={<MaterialUpdate />} />

            <Route path="/person" element={<PersonScreen />} />
            <Route path="/person-create" element={<PersonCreate />} />
            <Route path="/person-update-user/:id" element={<PersonUpdateById />} />
            <Route path="/person-update/" element={<PersonUpdate />} />

            <Route path="/order" element={<OrderScreen />} />
            <Route path="/order-create" element={<OrderCreateScreen />} />
            <Route path="/order-status" element={<OrderStatus />} />
            <Route path="/work" element={<WorkScreen />} />
            <Route path="/work-create" element={<WorkCreateScreen />} />
            <Route path="/work-status" element={<WorkStatus />} />

            <Route path="*" element={<Navigate to="/not-found" replace />} />
            <Route path="/not-found" element={<NotFoundScreen />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
