import React, { useEffect, useState } from "react";
import { Card } from "antd";
import axios from "axios";
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
import apiClient from "../Utils/ApiClient"; // apiClient'ı içeri aktar
import OrderStatus from "./Status/OrderStatus";
import WorkStatus from "./Status/WorkStatus";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

interface HomeScreenProps {
  onToggleMenu: () => void;
  activeTab: number;
  onTabChange: (tabId: number) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onToggleMenu, activeTab, onTabChange }) => {
  const [machineFailures, setMachineFailures] = useState<
    { name: string; count: number }[]
  >([]);
  const [recentFailures, setRecentFailures] = useState<string[]>([]);
  const [orderData, setOrderData] = useState<
    { name: string; count: number }[]
  >([]);
  const [workstationJobs, setWorkstationJobs] = useState<
    { name: string; jobs: number }[]
  >([]);

  const [menuOpen, setMenuOpen] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleMenuClick = (id: number) => {
    setSelectedId(id);
  };

  const fetchData = async () => {
    try {
      const [
        machineFaultRes,
        machineLatestFaultRes,
        orderStatusRes,
        workstationJobsRes,
      ] = await Promise.allSettled([
        apiClient.get(apiUrl.machineFault5),
        apiClient.get(apiUrl.machineLatestFault),
        apiClient.get(apiUrl.orderStatuses),
        apiClient.get(apiUrl.topPendingStations),
      ]);

      if (machineFaultRes.status === "fulfilled") {
        setMachineFailures(
            machineFaultRes.value.data.map((machine: any) => ({
              name: machine.name,
              count: machine.totalFault,
            }))
        );
      }

      if (machineLatestFaultRes.status === "fulfilled") {
        setRecentFailures(
            machineLatestFaultRes.value.data.map(
                (machine: any) =>
                    `${machine.name} - ${new Date(machine.createdAt).toLocaleString()}`
            )
        );
      }

      if (orderStatusRes.status === "fulfilled") {
        setOrderData(
            orderStatusRes.value.data.map((order: any) => ({
              name: order.statusName,
              count: order.count,
            }))
        );
      }

      if (workstationJobsRes.status === "fulfilled") {
        setWorkstationJobs(
            workstationJobsRes.value.data.map((station: any) => ({
              name: station.stationName,
              jobs: station.totalPendingItems,
            }))
        );
      }
    } catch (error) {
      console.error("Veri çekerken hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const tooltipFormatter = (value: any) => [`${value}`, "Arıza Sayısı"];
  const orderTooltipFormatter = (value: any) => [`${value}`, "Sipariş Sayısı"];

  const renderContent = () => {
    switch (activeTab) {
      case 1:
        return (
          <div style={{ padding: 20, display: "grid", gridGap: 20, gridTemplateRows: "auto auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gridGap: 20 }}>
              <Card title="En Çok Arıza Yapan Makineler">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={machineFailures} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={tooltipFormatter} />
                    <Legend />
                    <Bar dataKey="count" fill="#FF5733" barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card title="Sipariş Durumları">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={orderData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {orderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={orderTooltipFormatter} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gridGap: 20 }}>
              <Card title="İş İstasyonlarındaki İş Sayıları">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={workstationJobs} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}`, "İş Sayısı"]} />
                    <Legend />
                    <Bar dataKey="jobs" fill="#82ca9d" barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card title="Son Arıza Yapan Makineler">
                <ul>
                  {recentFailures.map((failure, index) => (
                    <li key={index}>{failure}</li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        );
      case 2:
        return <OrderStatus />;
      case 3:
        return <WorkStatus />;
      default:
        return <div>No valid tab selected</div>;
    }
  };

  return (
    <div>
      <HeaderComponent 
        onToggleMenu={onToggleMenu} 
        onMenuClick={onTabChange}
        activeTab={activeTab}
      />
      {renderContent()}
    </div>
  );
};

export default HomeScreen;
