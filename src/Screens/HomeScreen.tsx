import React, {useEffect, useState} from "react";
import {Card, List} from "antd";
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
import {apiUrl} from "../Settings";
import apiClient from "../Utils/ApiClient";
import ProductionStatus from "../Components/ProductionStatus";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

interface HomeScreenProps {
    onToggleMenu: () => void;
    activeTab: number;
    onTabChange: (tabId: number) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({onToggleMenu, activeTab, onTabChange}) => {
    const [orderData, setOrderData] = useState<{ name: string; count: number }[]>([]);
    const [workstationJobs, setWorkstationJobs] = useState<{ name: string; jobs: number }[]>([]);
    const [machineStatus, setMachineStatus] = useState<{ name: string; status: string }[]>([]);
    const [recentInstructions, setRecentInstructions] = useState<{ id: number; name: string; date: string }[]>([]);
    const [productionStats, setProductionStats] = useState<{ day: string; completed: number }[]>([]);

    const fetchData = async () => {
        try {
            const [
                productionInsRes,
                machinesRes,
            ] = await Promise.allSettled([
                apiClient.get(apiUrl.ProductionInsList),
                apiClient.get(apiUrl.machine),
            ]);

            if (productionInsRes.status === "fulfilled") {
                const data = productionInsRes.value.data;

                const completedOrders = data.filter((item: any) => item.isComplated === 1).length;
                const ongoingOrders = data.filter((item: any) => item.machineId > 0 && item.isComplated === 0).length;
                const notStart = data.filter((item: any) => item.machineId === 0).length;
                setOrderData([
                    {name: "Tamamlandı", count: completedOrders},
                    {name: "Devam Ediyor", count: ongoingOrders},
                    {name: "Başlamadı", count: notStart},
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
                                                <strong>{item.name}</strong>
                                                <div>{item.date}</div>
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
