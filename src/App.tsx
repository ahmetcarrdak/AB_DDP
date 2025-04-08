import React, {Suspense, useEffect, useState} from "react";
import {Route, Routes, useLocation, Navigate, useNavigate} from "react-router-dom";
import axios from 'axios';
import "react-toastify/dist/ReactToastify.css";
import {AuthProvider, useAuth} from "./context/AuthContext";
import ProtectedRoute from "./Components/ProtectedRoute";
import "react-toastify/dist/ReactToastify.css";
import DataUpdateComponent from "./DataUpdateComponent";
import MaintenanceCreateScreen from "./Screens/Create/MaintenanceCreateScreen";
import apiClient from "./Utils/ApiClient";
import {apiUrl} from "./Settings";

// Lazy load all screens
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
const DeletedMachinesScreen = React.lazy(() => import("./Screens/DeletedMachinesScreen"));
const MachineFaultScreen = React.lazy(
    () => import("./Screens/MachineFaultScreen")
);
const MaintenanceRecord = React.lazy(
    () => import("./Screens/MaintenanceRecordScreen")
);
const AuthScreen = React.lazy(() => import("./Screens/AuthScreen"));
const QRScreen = React.lazy(() => import("./Screens/QRScreen"));
const ProductionInstructionList = React.lazy(() => import("./Screens/ProductionInstructionSystem"))
const ProductionMachineTracker = React.lazy(() => import("./Screens/ProductionMachineTracker"))
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
);

const ProductionInstructionInsert = React.lazy(
    () => import("./Screens/Create/productionInstructionInsert")
);

// Lazy load Update Screens
const MaterialUpdateById = React.lazy(
    () => import("./Screens/Update/MaterialUpdateById")
);

const WorkUpdateById = React.lazy(
    () => import("./Screens/Update/WorkUpdateById")
);

const OrderUpdateById = React.lazy(
    () => import("./Screens/Update/OrderUpdateById")
);

const PersonUpdateById = React.lazy(
    () => import("./Screens/Update/PersonUpdateById")
);

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

function AppContent() {
    const navigate = useNavigate();
    const location = useLocation();
    const hideMenuRoutes = ["/auth", "/login", "/register", "/not-found", "/QR-Menu"];
    const showMenu = !hideMenuRoutes.includes(location.pathname);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const {isAuthenticated} = useAuth(); // Auth context'inden oturum durumunu al

    const [isMenuVisible, setIsMenuVisible] = useState(window.innerWidth > 768);
    const [activeTab, setActiveTab] = useState<number>(1);

    const handleToggleMenu = () => {
        setIsMenuVisible(!isMenuVisible);
    };

    const handleTabChange = (tabId: number) => {
        setActiveTab(tabId);
    };

    useEffect(() => {
        // API isteği yapılacak
        const fetchData = async () => {
            try {
                const response = await apiClient.get(apiUrl.machine);
                setData(response.data);
            } catch (error: any) {
                if (error.response && error.response.status === 401) {
                    // Eğer auth hatası alırsak, kullanıcıyı /auth sayfasına yönlendir
                    //console.log('Auth error, redirecting to /auth');
                    navigate('/auth', {replace: true});
                } else {
                    // Diğer hatalar için isterseniz başka işlemler yapabilirsiniz
                    //console.error(error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    return (
        <div className="App">
            <Suspense fallback={<LoadingSpinner/>}>
                {showMenu && isMenuVisible && isAuthenticated && (
                    <div className="menu">
                        <MenuComponent
                            onMenuClick={handleToggleMenu}
                            isVisible={isMenuVisible}
                        />
                    </div>
                )}
                <div className={`body ${!isMenuVisible || !isAuthenticated ? 'full-width' : ''}`}>
                    <Routes>
                        {/* Auth Routes - Oturum gerektirmeyen rotalar */}
                        <Route path="/auth" element={<AuthScreen/>}/>
                        <Route path="/not-found" element={<NotFoundScreen/>}/>
                        <Route path="/QR-Menu/:id" element={<QRScreen/>}/>

                        {/* Protected Routes - Oturum gerektiren rotalar */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <HomeScreen
                                        onToggleMenu={handleToggleMenu}
                                        activeTab={activeTab}
                                        onTabChange={handleTabChange}
                                    />
                                </ProtectedRoute>
                            }
                        />

                        {/* Store */}
                        <Route
                            path="/store"
                            element={
                                <ProtectedRoute>
                                    <StoreScreen onToggleMenu={handleToggleMenu}/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/material-add"
                            element={
                                <ProtectedRoute>
                                    <MaterialAddScreen/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/store-update-material/:id"
                            element={
                                <ProtectedRoute>
                                    <MaterialUpdateById/>
                                </ProtectedRoute>
                            }
                        />

                        {/* Person */}
                        <Route
                            path="/person"
                            element={
                                <ProtectedRoute>
                                    <PersonScreen onToggleMenu={handleToggleMenu}/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/person-create"
                            element={
                                <ProtectedRoute>
                                    <PersonCreate/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/person-update-user/:id"
                            element={
                                <ProtectedRoute>
                                    <PersonUpdateById/>
                                </ProtectedRoute>
                            }
                        />

                        {/* Order */}
                        <Route
                            path="/order"
                            element={
                                <ProtectedRoute>
                                    <OrderScreen onToggleMenu={handleToggleMenu}/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/order-create"
                            element={
                                <ProtectedRoute>
                                    <OrderCreateScreen/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/order-status"
                            element={
                                <ProtectedRoute>
                                    <OrderStatus/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/order-update-order/:id"
                            element={
                                <ProtectedRoute>
                                    <OrderUpdateById/>
                                </ProtectedRoute>
                            }
                        />

                        {/* Work */}
                        <Route
                            path="/work"
                            element={
                                <ProtectedRoute>
                                    <WorkScreen/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/work-create"
                            element={
                                <ProtectedRoute>
                                    <WorkCreateScreen/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/work-status"
                            element={
                                <ProtectedRoute>
                                    <WorkStatus/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/work-update-work/:id"
                            element={
                                <ProtectedRoute>
                                    <WorkUpdateById/>
                                </ProtectedRoute>
                            }
                        />

                        {/* Quality Control */}
                        <Route
                            path="/quality-control"
                            element={
                                <ProtectedRoute>
                                    <QualityControlScreen/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/quality-control-create"
                            element={
                                <ProtectedRoute>
                                    <QualityControlAddScreen/>
                                </ProtectedRoute>
                            }
                        />

                        {/* Machine */}
                        <Route
                            path="/machine"
                            element={
                                <ProtectedRoute>
                                    <MachineScreen onToggleMenu={handleToggleMenu}/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/machine-create"
                            element={
                                <ProtectedRoute>
                                    <MachineAddScreen onToggleMenu={handleToggleMenu}/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/machine-update-machine/:id"
                            element={
                                <ProtectedRoute>
                                    <MachineUpdateById onToggleMenu={handleToggleMenu}/>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path={"/deleted-machine"}
                            element={
                                <ProtectedRoute>
                                    <DeletedMachinesScreen onToggleMenu={handleToggleMenu}/>
                                </ProtectedRoute>
                            }
                        />

                        {/* Machine Fault */}
                        <Route
                            path="/machine-fault"
                            element={
                                <ProtectedRoute>
                                    <MachineFaultScreen onToggleMenu={handleToggleMenu}/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/machine-fault-create"
                            element={
                                <ProtectedRoute>
                                    <MachineFaultAddScreen onToggleMenu={handleToggleMenu}/>
                                </ProtectedRoute>
                            }
                        />

                        {/* Maintenance Record */}
                        <Route
                            path="/maintenance-record"
                            element={
                                <ProtectedRoute>
                                    <MaintenanceRecord onToggleMenu={handleToggleMenu}/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/maintenance-record-create"
                            element={
                                <ProtectedRoute>
                                    <MaintenanceCreateScreen/>
                                </ProtectedRoute>
                            }
                        />

                        {/* Production */}
                        <Route
                            path="/production-add"
                            element={
                                <ProtectedRoute>
                                    <ProductionInstructionInsert onToggleMenu={handleToggleMenu}/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/production-instructions"
                            element={
                                <ProtectedRoute>
                                    <ProductionInstructionList onToggleMenu={handleToggleMenu}/>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/production-tracker"
                            element={
                                <ProtectedRoute>
                                    <ProductionMachineTracker onToggleMenu={handleToggleMenu}/>
                                </ProtectedRoute>
                            }
                        />


                        {/* Redirect to auth if not found */}
                        <Route path="*" element={<Navigate to="/auth" replace/>}/>
                    </Routes>
                </div>
                <DataUpdateComponent/>
            </Suspense>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent/>
        </AuthProvider>
    );
}

export default App;