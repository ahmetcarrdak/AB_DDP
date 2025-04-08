import React, { useEffect, useState } from "react";
import { Card, List, message } from "antd";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import HeaderComponent from "../Components/HeaderComponent";
import { apiUrl } from "../Settings";
import apiClient from "../Utils/ApiClient";
import ProductionStatus from "../Components/ProductionStatus";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

interface HomeScreenProps {
    onToggleMenu: () => void;
    activeTab: number;
    onTabChange: (tabId: number) => void;
}

// Interfaces
interface Machine {
    id: number;
    productionInstructionId: number;
    machineId: number;
    line: number;
    entryDate: string;
    exitDate: string;
    status: any | number;
    machine: {
        id: number;
        companyId: number;
        name: string;
        model: string;
        serialNumber: string;
        manufacturer: string;
        purchaseDate: string;
        purchasePrice: number;
        lastMaintenanceDate: string;
        nextMaintenanceDate: string;
        description: string;
        isActive: boolean;
        location: string;
        warrantyPeriod: number;
        powerConsumption: string;
        dimensions: string;
        weight: string;
        company: any | null;
        totalFault: number;
        isOperational: boolean;
        createdAt: string;
        updatedAt: string;
    };
}

interface Store {
    id: number;
    productionInstructionId: number;
    name: string;
    barkod: string;
}

interface ProductToSeans {
    id: number;
    productId: number;
    count: number;
    barcode: string;
    machineId: number;
    batchSize: number;
    isCompleted: boolean;
    status: number;
}

interface ProductionInstruction {
    id: number;
    companyId: number;
    title: string;
    machineId: any | number;
    barcode: string;
    description: string;
    insertDate: string;
    complatedDate: string;
    deletedDate: string;
    isComplated: number;
    isDeleted: number;
    count: number;
    productionToMachines: Machine[];
    productionStores: Store[];
    productToSeans: ProductToSeans[];
}

const HomeScreen: React.FC<HomeScreenProps> = ({onToggleMenu, activeTab, onTabChange}) => {
    const [orderData, setOrderData] = useState<{ name: string; count: number }[]>([]);
    const [workstationJobs, setWorkstationJobs] = useState<{ name: string; jobs: number }[]>([]);
    const [machineStatus, setMachineStatus] = useState<{ name: string; status: string }[]>([]);
    const [recentInstructions, setRecentInstructions] = useState<{ id: number; title: string; insertDate: string }[]>([]);
    const [productionStats, setProductionStats] = useState<{ day: string; completed: number }[]>([]);

    const fetchData = async () => {
        try {
            const [productionInsRes, machinesRes] = await Promise.allSettled([
                apiClient.get(apiUrl.ProductionInsList),
                apiClient.get(apiUrl.machine),
            ]);

            if (productionInsRes.status === "fulfilled") {
                const data = productionInsRes.value.data.filter((item: any) => item.isDeleted === 0);

                let completed = 0;
                let ongoing = 0;
                let notStarted = 0;

                data.forEach((item: any) => {
                    const seansList = item.productToSeans || [];
                    const totalCompleted = seansList
                        .filter((s: any) => s.isCompleted)
                        .reduce((sum: number, s: any) => sum + s.count, 0);

                    if (totalCompleted === 0) {
                        notStarted++;
                    } else if (totalCompleted >= item.count) {
                        completed++;
                    } else {
                        ongoing++;
                    }
                });

                setOrderData([
                    { name: "Tamamlandı", count: completed },
                    { name: "Devam Ediyor", count: ongoing },
                    { name: "Başlamadı", count: notStarted },
                ]);

                const machineJobCounts = data.reduce((acc: { [key: string]: number }, item: any) => {
                    item.productionToMachines.forEach((machine: any) => {
                        const machineName = machine.machine.name;
                        acc[machineName] = (acc[machineName] || 0) + 1;
                    });
                    return acc;
                }, {});

                setWorkstationJobs(
                    Object.entries(machineJobCounts).map(([name, jobs]) => ({
                        name,
                        jobs: jobs as number,
                    }))
                );

                setRecentInstructions(
                    data.slice(0, 5).map((item: any) => ({
                        id: item.id,
                        title: item.title,
                        insertDate: item.insertDate,
                    }))
                );
            }

            if (machinesRes.status === "fulfilled") {
                setMachineStatus(
                    machinesRes.value.data.map((machine: any) => ({
                        name: machine.name,
                        status: machine.isActive ? "Aktif" : "Boşta"
                    }))
                );
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const orderTooltipFormatter = (value: any) => [`${value}`, "Sipariş Sayısı"];
    const statusTooltipFormatter = (value: any) => [`${value}`, "Makine Sayısı"];

    const renderContent = () => {
        switch (activeTab) {
            case 1:
                return (
                    <div style={{padding: 20, display: "grid", gridGap: 20, gridTemplateRows: "auto auto"}}>
                        <div style={{display: "grid", gridTemplateColumns: "3fr 1fr", gridGap: 20}}>
                            <Card title="Haftalık Üretim Tamamlanma">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={productionStats} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                                        <XAxis dataKey="day"/>
                                        <YAxis/>
                                        <Tooltip formatter={orderTooltipFormatter}/>
                                        <Legend/>
                                        <Bar dataKey="completed" fill="#8884D8" barSize={30}/>
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>

                            <Card title="Sipariş Durumu">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={orderData} dataKey="count" nameKey="name" cx="50%" cy="50%"
                                             outerRadius={80} label>
                                            {orderData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={orderTooltipFormatter}/>
                                        <Legend/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </Card>
                        </div>

                        <div style={{display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gridGap: 20}}>
                            <Card title="İstasyon Görev Dağılımı">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={workstationJobs} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                                        <XAxis dataKey="name"/>
                                        <YAxis/>
                                        <Tooltip formatter={(value) => [`${value}`, "Görev Sayısı"]}/>
                                        <Legend/>
                                        <Bar dataKey="jobs" fill="#82ca9d" barSize={30}/>
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>

                            <Card title="Makine Durumları">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={machineStatus.reduce((acc, item) => {
                                                const existing = acc.find(x => x.name === item.status);
                                                if (existing) {
                                                    existing.count++;
                                                } else {
                                                    acc.push({ name: item.status, count: 1 });
                                                }
                                                return acc;
                                            }, [] as { name: string; count: number }[])}
                                            dataKey="count"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label
                                        >
                                            {machineStatus.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={statusTooltipFormatter}/>
                                        <Legend/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </Card>

                            <Card title="Son İş Talimatları">
                                <List
                                    dataSource={recentInstructions}
                                    renderItem={(item) => (
                                        <List.Item>
                                            <div>
                                                <strong>{item.title}</strong>
                                                <div>{item.insertDate}</div>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </div>
                    </div>
                );
            case 2:
                return <ProductionStatus />;
            default:
                return <div>Geçerli bir sekme seçilmedi</div>;
        }
    };

    return (
        <div>
            <HeaderComponent
                onToggleMenu={onToggleMenu}
                //@ts-ignore
                onMenuClick={onTabChange}
                activeTab={activeTab}
            />
            {renderContent()}
        </div>
    );
};

export default HomeScreen;
