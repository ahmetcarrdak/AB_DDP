import React, { Suspense, useState } from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

// Lazy load all screens
const LoginScreen = React.lazy(() => import("./Screens/Auth/LoginScreen"));
const RegisterScreen = React.lazy(
  () => import("./Screens/Auth/RegisterScreen")
);
const HomeScreen = React.lazy(() => import("./Screens/HomeScreen"));
const NotFoundScreen = React.lazy(() => import("./Screens/NotFoundScreen"));
const StoreScreen = React.lazy(() => import("./Screens/StoreScreen"));
const PersonScreen = React.lazy(() => import("./Screens/PersonScreen"));
const OrderScreen = React.lazy(() => import("./Screens/OrderScreen"));
const WorkScreen = React.lazy(() => import("./Screens/WorkScreen"));
const CompanySettingsScreen = React.lazy(
  () => import("./Screens/CompanySettingsScreen")
);

// Lazy load Create Screens
const MaterialAddScreen = React.lazy(
  () => import("./Screens/Create/MaterialAddScreen")
);
const WorkCreateScreen = React.lazy(
  () => import("./Screens/Create/WorkCreateScreen")
);
const OrderCreateScreen = React.lazy(
  () => import("./Screens/Create/OrderCreateScreen")
);
const PersonCreate = React.lazy(
  () => import("./Screens/Create/PersonCreateScreen")
);

// Lazy load Update Screens
const MaterialUpdateById = React.lazy(
  () => import("./Screens/Update/MaterialUpdateById")
);
const MaterialUpdate = React.lazy(
  () => import("./Screens/Update/MaterialUpdate")
);
const WorkUpdateById = React.lazy(
  () => import("./Screens/Update/WorkUpdateById")
);
const WorkUpdate = React.lazy(() => import("./Screens/Update/WorkUpdate"));
const OrderUpdateById = React.lazy(
  () => import("./Screens/Update/OrderUpdateById")
);
const OrderUpdate = React.lazy(() => import("./Screens/Update/OrderUpdate"));
const PersonUpdateById = React.lazy(
  () => import("./Screens/Update/PersonUpdateById")
);
const PersonUpdate = React.lazy(() => import("./Screens/Update/PersonUpdate"));

// Lazy load Status Screens
const WorkStatus = React.lazy(() => import("./Screens/Status/WorkStatus"));
const OrderStatus = React.lazy(() => import("./Screens/Status/OrderStatus"));

// Components
const MenuComponent = React.lazy(() => import("./Components//MenuComponent"));

// Loading Component
const LoadingSpinner = () => (
  <div className="loading_container">
    <span></span>
    <span></span>
    <span></span>
    <span></span>
  </div>
);

function App() {
  const location = useLocation();
  const hideMenuRoutes = ["/login", "/register", "/not-found"];

  return (
    <div className="App">
      {/* Menu Visibility */}
      {!hideMenuRoutes.includes(location.pathname) && (
        <div className="menu">
          <MenuComponent />
        </div>
      )}

      {/* Routes with Suspense for Loading */}
      <div className="body">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Home */}
            <Route path="/" element={<HomeScreen />} />

            {/* Company Settings */}
            <Route
              path="/company-settings"
              element={<CompanySettingsScreen />}
            />

            {/* Authentication */}
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />

            {/* Store */}
            <Route path="/store" element={<StoreScreen />} />
            <Route path="/material-add" element={<MaterialAddScreen />} />
            <Route
              path="/store-update-material/:id"
              element={<MaterialUpdateById />}
            />
            <Route path="/material-update" element={<MaterialUpdate />} />

            {/* Person */}
            <Route path="/person" element={<PersonScreen />} />
            <Route path="/person-create" element={<PersonCreate />} />
            <Route
              path="/person-update-user/:id"
              element={<PersonUpdateById />}
            />
            <Route path="/person-update" element={<PersonUpdate />} />

            {/* Order */}
            <Route path="/order" element={<OrderScreen />} />
            <Route path="/order-create" element={<OrderCreateScreen />} />
            <Route path="/order-status" element={<OrderStatus />} />
            <Route
              path="/order-update-order/:id"
              element={<OrderUpdateById />}
            />
            <Route path="/order-update" element={<OrderUpdate />} />

            {/* Work */}
            <Route path="/work" element={<WorkScreen />} />
            <Route path="/work-create" element={<WorkCreateScreen />} />
            <Route path="/work-status" element={<WorkStatus />} />
            <Route path="/work-update-work/:id" element={<WorkUpdateById />} />
            <Route path="/work-update" element={<WorkUpdate />} />

            {/* Not Found */}
            <Route path="*" element={<Navigate to="/not-found" replace />} />
            <Route path="/not-found" element={<NotFoundScreen />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

export default App;
