import React, { memo, useEffect, useState } from 'react';
import { Select, Timeline, Card, Typography } from 'antd';
import axios from 'axios';

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
    stationId: number;
}

const OrderStatus = memo(() => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [stations, setStations] = useState<Station[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [currentStation, setCurrentStation] = useState<number | null>(null);

    useEffect(() => {
        // Fetch stations
        const fetchStations = async () => {
            try {
                const response = await axios.get<Station[]>('http://localhost:5262/api/Station/GetAll');
                setStations(response.data);
                console.log(response.data);
            } catch (error) {
                console.error('Error fetching stations:', error);
            }
        };

        // Fetch orders
        const fetchOrders = async () => {
            try {
                const response = await axios.get<Order[]>('http://localhost:5262/api/Order/all');
                setOrders(response.data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        fetchStations();
        fetchOrders();
    }, []);

    const handleOrderChange = (orderId: string) => {
        const order = orders.find(o => o.orderId === parseInt(orderId));
        setSelectedOrder(order || null);
        setCurrentStation(order?.stationId || null);
    };

    const filterOption = (input: string, option?: { label: string; value: string }) => {
        if (!option) return false;
        return option.label.toLowerCase().includes(input.toLowerCase());
    };

    return (
        <div style={{ padding: '20px' }}>
            <Title level={2}>Sipariş Durumu</Title>

            <Card style={{ marginBottom: '20px' }}>
                <Select
                    style={{ width: '100%' }}
                    placeholder="Sipariş Seçiniz"
                    onChange={handleOrderChange}
                    showSearch
                    filterOption={filterOption}
                    options={orders.map(order => ({
                        value: order.orderId.toString(),
                        label: `${order.orderDate.substring(0, 10)} - ${order.customerName} - ${order.productName}`
                    }))}
                />
            </Card>

            {selectedOrder && (
                <Timeline
                    mode="alternate"
                    items={stations
                        .sort((a, b) => a.orderNumber - b.orderNumber)
                        .map(station => {
                            const currentStationObj = stations.find(s => s.stationId === currentStation);
                            const currentStationOrderNumber = currentStationObj?.orderNumber || 0;

                            return {
                                color: station.stationId === currentStation ? 'blue' :
                                      station.orderNumber < currentStationOrderNumber ? 'green' : 'gray',
                                children: (
                                    <div>
                                        <h4>{station.name}</h4>
                                        <p>{station.description}</p>
                                        {station.stationId === currentStation && (
                                            <strong>Aktif İstasyon</strong>
                                        )}
                                    </div>
                                )
                            };
                        })}
                />
            )}
        </div>
    );
});

export default OrderStatus;
