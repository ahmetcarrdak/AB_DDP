import React, { Suspense, useState } from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import DataUpdateComponent from "./DataUpdateComponent";
import MaintenanceCreateScreen from "./Screens/Create/MaintenanceCreateScreen";

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
const QualityControlScreen = React.lazy(
  () => import("./Screens/QualityControlScreen")
);
const MachineScreen = React.lazy(() => import("./Screens/MachineScreen"));
const MachineFaultScreen = React.lazy(
  () => import("./Screens/MachineFaultScreen")
);
const MaintenanceRecord = React.lazy(
  () => import("./Screens/MaintenanceRecordScreen")
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
const QualityControlAddScreen = React.lazy(
  () => import("./Screens/Create/QualityControlAddScreen")
);
const MachineAddScreen = React.lazy(
  () => import("./Screens/Create/MachineAddScreen")
);
const MachineFaultAddScreen = React.lazy(
  () => import("./Screens/Create/MachineFaultAddScreen")
);

const MachineCreateScreen = React.lazy(
  () => import("./Screens/Create/MaintenanceCreateScreen")
)

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
const MachineUpdateById = React.lazy(
  () => import("./Screens/Update/MachineUpdateById")
);

// Lazy load Status Screens
const WorkStatus = React.lazy(() => import("./Screens/Status/WorkStatus"));
const OrderStatus = React.lazy(() => import("./Screens/Status/OrderStatus"));

// Components
const MenuComponent = React.lazy(() => import("./Components/MenuComponent"));

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
  const showMenu = !hideMenuRoutes.includes(location.pathname);

  const [isMenuVisible, setIsMenuVisible] = useState(window.innerWidth > 768);
  const [activeTab, setActiveTab] = useState<number>(1);

  const handleToggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  const handleTabChange = (tabId: number) => {
    setActiveTab(tabId);
  };

  return (
    <div className="App">
      <Suspense fallback={<LoadingSpinner />}>
        {showMenu && isMenuVisible && (
          <div className="menu">
            <MenuComponent 
              onMenuClick={handleToggleMenu} 
              isVisible={isMenuVisible} 
            />
          </div>
        )}
        <div className={`body ${!isMenuVisible ? 'full-width' : ''}`}>
          <Routes>
            {/* Home */}
            <Route path="/" element={
              <HomeScreen 
                onToggleMenu={handleToggleMenu}
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />
            } />

            {/* Company Settings */}
            <Route
              path="/company-settings"
              element={<CompanySettingsScreen />}
            />

            {/* Authentication */}
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />

            {/* Store */}
            <Route path="/store" element={
              <StoreScreen onToggleMenu={handleToggleMenu} />
            } />
            <Route path="/material-add" element={<MaterialAddScreen />} />
            <Route
              path="/store-update-material/:id"
              element={<MaterialUpdateById />}
            />
            <Route path="/material-update" element={<MaterialUpdate />} />

            {/* Person */}
            <Route path="/person" element={
              <PersonScreen onToggleMenu={handleToggleMenu} />
            } />
            <Route path="/person-create" element={<PersonCreate />} />
            <Route
              path="/person-update-user/:id"
              element={<PersonUpdateById />}
            />
            <Route path="/person-update" element={<PersonUpdate />} />

            {/* Order */}
            <Route path="/order" element={
              <OrderScreen onToggleMenu={handleToggleMenu} />
            } />
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

            {/* Quality Control */}
            <Route path="/quality-control" element={<QualityControlScreen />} />
            <Route
              path="/quality-control-create"
              element={<QualityControlAddScreen />}
            />

            {/* Machine */}
            <Route path="/machine" element={<MachineScreen />} />
            <Route path="/machine-create" element={<MachineAddScreen />} />
            <Route
              path="/machine-update-machine/:id"
              element={<MachineUpdateById />}
            />

            {/* Machine Fault */}
            <Route path="/machine-fault" element={<MachineFaultScreen />} />
            <Route
              path="/machine-fault-create"
              element={<MachineFaultAddScreen />}
            />

            {/* Maintenance Record */}
            <Route path="/maintenance-record" element={<MaintenanceRecord />} />
            <Route path="/maintenance-record-create" element={<MaintenanceCreateScreen/>}></Route>

            {/* Not Found */}
            <Route path="*" element={<Navigate to="/not-found" replace />} />
            <Route path="/not-found" element={<NotFoundScreen />} />
          </Routes>
        </div>
        <DataUpdateComponent />
      </Suspense>
    </div>
  );
}

export default App;
