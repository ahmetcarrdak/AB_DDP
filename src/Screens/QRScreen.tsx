import React, { useEffect, useState } from "react";
import { Form, Input, Button, Select, Spin, notification } from "antd";
import { useParams } from "react-router-dom";
import apiClient from "../Utils/ApiClient"; // apiClient'ı import et
import { toast } from "react-toastify";
import { UserOutlined, KeyOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;

const QRScreen = () => {
    const { id } = useParams<{ id: string }>(); // URL parametresi olarak makina id'sini alıyoruz
    const [user, setUser] = useState<any>(null); // Kullanıcı bilgisi
    const [stations, setStations] = useState<any[]>([]); // İstasyonlar
    const [stages, setStages] = useState<any[]>([]); // Stages
    const [orderDetails, setOrderDetails] = useState<any>(null); // Sipariş detayları
    const [isLoading, setIsLoading] = useState<boolean>(false); // Yükleniyor durumu
    const [form] = Form.useForm();

    // Kullanıcı bilgilerini ve ilgili verileri çekme
    useEffect(() => {
        // Kullanıcı bilgilerini çekme
        const fetchUserData = async () => {
            try {
                const response = await apiClient.get("/user/me"); // Kullanıcının bilgilerini al
                setUser(response.data);
            } catch (error) {
                console.error("Kullanıcı bilgileri alınırken hata oluştu:", error);
                toast.error("Kullanıcı bilgileri alınırken bir hata oluştu", {
                    position: "bottom-right",
                    autoClose: 3000,
                    theme: "colored",
                });
            }
        };

        // Sipariş ve istasyonları çekme
        const fetchData = async () => {
            setIsLoading(true);

            try {
                const [stationsResponse, stagesResponse, orderResponse] = await Promise.all([
                    apiClient.get("/stations"), // İstasyonları al
                    apiClient.get("/stages"), // Stages'leri al
                    apiClient.get(`/orders/${id}`), // İlgili siparişi al
                ]);

                setStations(stationsResponse.data);
                setStages(stagesResponse.data);
                setOrderDetails(orderResponse.data);
            } catch (error) {
                console.error("Veri çekme hatası:", error);
                toast.error("Veri çekme hatası oluştu", {
                    position: "bottom-right",
                    autoClose: 3000,
                    theme: "colored",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
        fetchData();
    }, [id]);

    const handleSubmit = async (values: any) => {
        setIsLoading(true);
        try {
            const payload = {
                ...values,
                machineId: id,
                userId: user?.id, // Kullanıcı id'si
            };

            // Veriyi API'ye gönder
            await apiClient.post("/submit", payload);
            notification.success({
                message: "Başarıyla gönderildi",
                description: "Veri başarıyla gönderildi.",
            });
        } catch (error) {
            console.error("Veri gönderme hatası:", error);
            toast.error("Veri gönderme hatası oluştu", {
                position: "bottom-right",
                autoClose: 3000,
                theme: "colored",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <Spin tip="Yükleniyor..." />;

    return (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px" }}>
            <h2>Makine {id} için QR Kod Ekranı</h2>

            <Form form={form} onFinish={handleSubmit}>
                <Form.Item label="Makine ID" name="machineId" initialValue={id} hidden>
                    <Input disabled />
                </Form.Item>

                <Form.Item label="Kullanıcı" name="user" initialValue={user?.name}>
                    <Input disabled prefix={<UserOutlined />} />
                </Form.Item>

                <Form.Item label="Oturum Durumu" name="session" initialValue={user ? "Aktif" : "Yok"}>
                    <Input disabled prefix={<KeyOutlined />} />
                </Form.Item>

                <Form.Item label="Sipariş" name="order" initialValue={orderDetails?.orderNumber}>
                    <Input disabled />
                </Form.Item>

                <Form.Item label="İstasyon" name="station" rules={[{ required: true, message: "Lütfen bir istasyon seçin!" }]}>
                    <Select placeholder="İstasyon seçin" allowClear>
                        {stations.map((station) => (
                            <Option key={station.id} value={station.id}>
                                {station.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item label="Stage" name="stage" rules={[{ required: true, message: "Lütfen bir stage seçin!" }]}>
                    <Select placeholder="Stage seçin" allowClear>
                        {stages.map((stage) => (
                            <Option key={stage.id} value={stage.id}>
                                {stage.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item label="Açıklama" name="description">
                    <Input.TextArea rows={4} placeholder="Açıklama yazın" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Veriyi Yükle
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default QRScreen;
