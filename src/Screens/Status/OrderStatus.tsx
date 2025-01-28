import React, { memo, useEffect, useState } from "react";
import { Select, Timeline, Card, Typography, Tag } from "antd";
import axios from "axios";
import { apiUrl } from "../../Settings";

const { Option } = Select;
const { Title } = Typography;

interface Station {
  stationId: number;
  name: string;
  description: string;
  orderNumber: number;
}

interface Order {
  orderId: number;
  orderDate: string;
  customerName: string;
  productName: string;
  stagesId: number; // Added to match the stages data
}

interface Stage {
  stageId: number;
  stageName: string;
}

interface StationInfo {
  stationId: number;
  stagesId: number;
  orderId: number;
  productName: string;
  customerName: string;
  specialInstructions: string;
  priority: string;
  assignedEmployeeId: number;
  quantity: number;
  estimatedDeliveryDate: string;
  actualDeliveryDate: string;
}

const OrderStatus = memo(() => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [stationInfo, setStationInfo] = useState<StationInfo | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [stationsResponse, ordersResponse] = await Promise.all([
          axios.get<Station[]>(apiUrl.station),
          axios.get<Order[]>(apiUrl.order),
        ]);

        // Directly use the stages data passed from the backend
        const stagesData: Stage[] = [
          { stageId: 1, stageName: "Onay Bekliyor" },
          { stageId: 3, stageName: "Bitirildi" },
          { stageId: 4, stageName: "Çıkışı Yapıldı" },
          { stageId: 2, stageName: "İşleme Alındı" }
        ];

        setStations(
          stationsResponse.data.sort((a, b) => a.orderNumber - b.orderNumber)
        );
        setOrders(ordersResponse.data);
        setStages(stagesData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  const handleOrderChange = async (orderId: string) => {
    try {
      const order = orders.find((o) => o.orderId === parseInt(orderId));
      setSelectedOrder(order || null);

      const stationInfoResponse = await axios.get<StationInfo>(
        `${apiUrl.stationInfoOrder}/${orderId}`
      );
      setStationInfo(stationInfoResponse.data);
    } catch (error) {
      console.error("Error fetching station info:", error);
      setStationInfo(null);
    }
  };

  const filterOption = (
    input: string,
    option?: { label: string; value: string }
  ) => {
    if (!option) return false;
    return option.label.toLowerCase().includes(input.toLowerCase());
  };

  const getCurrentStage = (stagesId: number) => {
    const stage = stages.find(s => s.stageId === stagesId);
    return stage ? stage.stageName : "Bilinmeyen Aşama";
  };

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Sipariş Durumu</Title>

      <Card style={{ marginBottom: "20px" }}>
        <Select
          style={{ width: "100%" }}
          placeholder="Sipariş Seçiniz"
          onChange={handleOrderChange}
          showSearch
          filterOption={filterOption}
          options={orders.map((order) => ({
            value: order.orderId.toString(),
            label: `${order.orderDate.substring(0, 10)} - ${
              order.customerName
            } - ${order.productName}`,
          }))}
        />
      </Card>

      {selectedOrder && stationInfo && (
        <Card>
          <div style={{ marginBottom: "20px" }}>
            <Title level={4}>Sipariş Detayları</Title>
            <p>
              <strong>Ürün:</strong> {stationInfo.productName}
            </p>
            <p>
              <strong>Müşteri:</strong> {stationInfo.customerName}
            </p>
            <p>
              <strong>Miktar:</strong> {stationInfo.quantity}
            </p>
            <p>
              <strong>Öncelik:</strong>{" "}
              <Tag color={stationInfo.priority === "Yüksek" ? "red" : "green"}>
                {stationInfo.priority}
              </Tag>
            </p>
            <p>
              <strong>İstasyonda ki Aşama:</strong>{" "}
              <Tag color="blue">{getCurrentStage(stationInfo.stagesId)}</Tag>
            </p>
            <p>
              <strong>Tahmini Teslimat:</strong>{" "}
              {stationInfo.estimatedDeliveryDate}
            </p>
            <p>
              <strong>Özel Talimatlar:</strong>{" "}
              {stationInfo.specialInstructions}
            </p>
          </div>

          <Title level={4}>İstasyon Süreci</Title>
          <Timeline
            mode="alternate"
            items={stations.map((station) => ({
              color:
                station.stationId === stationInfo.stationId ? "blue" : "gray",
              children: (
                <div>
                  <h4>{station.name}</h4>
                  <p>{station.description}</p>
                  {station.stationId === stationInfo.stationId && (
                    <strong>Aktif İstasyon</strong>
                  )}
                </div>
              ),
            }))}
          />
        </Card>
      )}
    </div>
  );
});

export default OrderStatus;