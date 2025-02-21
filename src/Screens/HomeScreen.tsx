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
import OrderStatus from "./Status/OrderStatus";
import WorkStatus from "./Status/WorkStatus";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const HomeScreen: React.FC = () => {
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

  useEffect(() => {
    axios
      .get(apiUrl.machineFault5)
      .then((response) => {
        const transformedData = response.data.map((machine: any) => ({
          name: machine.name,
          count: machine.totalFault,
        }));
        setMachineFailures(transformedData);
      })
      .catch((error) => {
        console.error("API'den veri alınırken hata oluştu:", error);
      });

    axios
      .get(apiUrl.machineLatestFault)
      .then((response) => {
        const failures = response.data.map(
          (machine: any) =>
            `${machine.name} - ${new Date(machine.createdAt).toLocaleString()}`
        );
        setRecentFailures(failures);
      })
      .catch((error) => {
        console.error("Son arızalar alınırken hata oluştu:", error);
      });

    axios
      .get("http://localhost:5262/api/Order/statuses")
      .then((response) => {
        const transformedOrderData = response.data.map((order: any) => ({
          name: order.statusName,
          count: order.count,
        }));
        setOrderData(transformedOrderData);
      })
      .catch((error) => {
        console.error("Sipariş durumları alınırken hata oluştu:", error);
      });

    // İş istasyonlarındaki bekleyen işlerin verisini alalım
    axios
      .get("http://localhost:5262/api/station/top-pending-stations")  // API'nizin endpointi
      .then((response) => {
        const transformedWorkstationJobs = response.data.map((station: any) => ({
          name: station.stationName,
          jobs: station.totalPendingItems,  // Bekleyen toplam iş sayısı
        }));
        setWorkstationJobs(transformedWorkstationJobs);
      })
      .catch((error) => {
        console.error("İş İstasyonlarındaki İşler alınırken hata oluştu:", error);
      });
  }, []);

  const tooltipFormatter = (value: any) => [`${value}`, "Arıza Sayısı"];
  const orderTooltipFormatter = (value: any) => [`${value}`, "Sipariş Sayısı"];

  return (
    <>
      <HeaderComponent onMenuClick={handleMenuClick} />
      {selectedId === 1 || selectedId === null ? (
        <div
          style={{
            padding: 20,
            display: "grid",
            gridGap: 20,
            gridTemplateRows: "auto auto",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "3fr 1fr",
              gridGap: 20,
            }}
          >
            <Card title="En Çok Arıza Yapan Makineler">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={machineFailures}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
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
                  <Pie
                    data={orderData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {orderData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={orderTooltipFormatter} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "3fr 1fr",
              gridGap: 20,
            }}
          >
            <Card title="İş İstasyonlarındaki İş Sayıları">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={workstationJobs}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
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
      ) : selectedId === 2 ? (
        <OrderStatus />
      ) : selectedId === 3 ? (
        <WorkStatus />
      ) : (
        <div>No valid ID selected</div>
      )}
    </>
  );
};

export default HomeScreen;
