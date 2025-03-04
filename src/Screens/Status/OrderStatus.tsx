import React, { memo, useEffect, useState } from "react";
import { Table, Card, Typography, Tag } from "antd";
import axios from "axios";
import { apiUrl } from "../../Settings";
import apiClient from "../../Utils/ApiClient";
import {toast, ToastContainer} from "react-toastify";

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
    stagesId: number;
    priority: string;
    quantity: number;
    estimatedDeliveryDate: string;
    specialInstructions: string;
}

interface Stage {
    stageId: number;
    stageName: string;
}

const OrderStatus = memo(() => {
    const [stations, setStations] = useState<Station[]>([]);
    const [ordersByStation, setOrdersByStation] = useState<{ [key: number]: Order[] }>({});
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // İlk verileri çekme işlemi
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true); // Yükleme başladığını belirtiyoruz

            try {
                // API isteklerini paralel olarak yapıyoruz
                const [stationsResponse, ordersResponse] = await Promise.all([
                    apiClient.get<Station[]>(apiUrl.station),
                    apiClient.get<Order[]>(apiUrl.stationInfoOrder),
                ]);

                // İstasyonları sıralıyoruz
                const stationsData = stationsResponse.data.sort((a, b) => a.orderNumber - b.orderNumber);
                setStations(stationsData);

                // Siparişleri istasyonlara göre gruplayarak ayarlıyoruz
                const ordersGroupedByStation: { [key: number]: Order[] } = {};
                ordersResponse.data.forEach((order) => {
                    if (!ordersGroupedByStation[order.stagesId]) {
                        ordersGroupedByStation[order.stagesId] = [];
                    }
                    ordersGroupedByStation[order.stagesId].push(order);
                });

                setOrdersByStation(ordersGroupedByStation);
            } catch (error) {
                console.error("Veriler alınırken bir hata oluştu:", error);
                toast.error("Veriler alınırken bir hata oluştu", {
                    position: "bottom-right",
                    autoClose: 3000,
                    theme: "colored",
                });
            } finally {
                setIsLoading(false); // Yükleme tamamlandı
            }
        };

        fetchInitialData();
    }, []);

    const columns = stations.map((station) => ({
        title: station.name,
        dataIndex: station.stationId,
        render: (orders: Order[]) =>
            orders && orders.length > 0 ? (
                orders.map((order) => (
                    <p key={order.orderId} style={{ cursor: "pointer", color: "blue" }} onClick={() => setSelectedOrder(order)}>
                        {order.productName}
                    </p>
                ))
            ) : (
                <Typography.Text> - </Typography.Text>
            ),
    }));

    const data = Object.keys(ordersByStation).map((stageId, index) => {
        const rowData: { [key: string]: any } = { key: index };
        stations.forEach((station) => {
            rowData[station.stationId] = ordersByStation[parseInt(stageId)]?.filter((order) => order.stagesId === station.stationId);
        });
        return rowData;
    });

    return (
        <div style={{ padding: "20px" }}>
            <ToastContainer />
            <Title level={2}>İstasyonlar ve Siparişler</Title>
            {isLoading ? (
                <Card>
                    <Typography.Text>Yükleniyor...</Typography.Text>
                </Card>
            ) : (
                <Table columns={columns} dataSource={data} pagination={false} bordered />
            )}
            {selectedOrder && (
                <Card title={`Sipariş Detayı - ${selectedOrder.productName}`} style={{ marginTop: "20px" }}>
                    <p><strong>Müşteri:</strong> {selectedOrder.customerName}</p>
                    <p><strong>Miktar:</strong> {selectedOrder.quantity} Adet</p>
                    <p><strong>Öncelik:</strong> <Tag color={selectedOrder.priority === "Yüksek" ? "red" : "green"}>{selectedOrder.priority}</Tag></p>
                    <p><strong>Tahmini Teslimat:</strong> {selectedOrder.estimatedDeliveryDate}</p>
                    <p><strong>Özel Talimatlar:</strong> {selectedOrder.specialInstructions}</p>
                </Card>
            )}
        </div>
    );
});

export default OrderStatus;
