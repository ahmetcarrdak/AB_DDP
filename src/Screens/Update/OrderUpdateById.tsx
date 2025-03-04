import React, {useState, useEffect} from "react";
import {
    Form,
    Input,
    DatePicker,
    InputNumber,
    Switch,
    Button,
    Card,
    Row,
    Col,
    Typography,
    Spin,
    Select,
    Popconfirm,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import {apiUrl} from "../../Settings";
import {toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {useParams} from "react-router-dom";
import apiClient from "../../Utils/ApiClient";

const {Title} = Typography;
const {Option} = Select;

const OrderUpdateById = () => {
    const {id} = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const [isLoadingOrder, setIsLoadingOrder] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Sipariş detaylarını alacak olan useEffect
    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!id) return; // id yoksa işlemi başlatma

            setIsLoadingOrder(true); // Yükleme başladığını belirtiyoruz
            try {
                const response = await apiClient.get(`${apiUrl.orderById}/${id}`);  // apiClient kullanımı
                const data = response.data;

                // Verileri düzenleyerek form alanlarına atıyoruz
                const updatedData = {
                    ...data,
                    orderDate: data.orderDate ? dayjs(data.orderDate) : null,
                    estimatedDeliveryDate: data.estimatedDeliveryDate ? dayjs(data.estimatedDeliveryDate) : null,
                    actualDeliveryDate: data.actualDeliveryDate ? dayjs(data.actualDeliveryDate) : null,
                    cancellationDate: data.cancellationDate ? dayjs(data.cancellationDate) : null,
                };

                form.setFieldsValue(updatedData); // Form alanlarını güncelliyoruz
            } catch (error) {
                console.error("Sipariş bilgileri alınırken hata oluştu:", error);
                toast.error("Sipariş bilgileri yüklenirken bir hata oluştu", {
                    position: "bottom-right",
                    autoClose: 3000,
                    theme: "colored",
                });
            } finally {
                setIsLoadingOrder(false); // Yükleme bitiyor
            }
        };

        fetchOrderDetails();
    }, [id, form]); // id veya form değiştiğinde bu effect çalışır

// Sipariş güncelleme fonksiyonu
    const onFinish = async (values: any) => {
        setIsUpdating(true); // Güncelleme işlemi başladığını belirtiyoruz
        try {
            // Tarihleri uygun formata dönüştürüp düzenliyoruz
            const formattedValues = {
                ...values,
                orderDate: values.orderDate ? values.orderDate.toISOString() : null,
                estimatedDeliveryDate: values.estimatedDeliveryDate ? values.estimatedDeliveryDate.toISOString() : null,
                actualDeliveryDate: values.actualDeliveryDate ? values.actualDeliveryDate.toISOString() : null,
                cancellationDate: values.cancellationDate ? values.cancellationDate.toISOString() : null,
            };

            // Siparişi güncelliyoruz
            await apiClient.put(`${apiUrl.updateOrder}/${id}`, formattedValues);  // apiClient kullanımı
            toast.success("Sipariş başarıyla güncellendi", {
                position: "bottom-right",
                autoClose: 3000,
                theme: "colored",
            });
        } catch (error) {
            console.error("Sipariş güncellenirken hata oluştu:", error);
            toast.error("Sipariş güncellenirken bir hata oluştu", {
                position: "bottom-right",
                autoClose: 3000,
                theme: "colored",
            });
        } finally {
            setIsUpdating(false); // Güncelleme işlemi tamamlanıyor
        }
    };

// Sipariş iptal etme fonksiyonu
    const handleCancelOrder = async () => {
        try {
            await apiClient.put(`${apiUrl.cancelOrder}/${id}`);  // apiClient kullanımı
            toast.success("Sipariş başarıyla iptal edildi", {
                position: "bottom-right",
                autoClose: 3000,
                theme: "colored",
            });
        } catch (error) {
            console.error("Sipariş iptal edilirken hata oluştu:", error);
            toast.error("Sipariş iptal edilirken bir hata oluştu", {
                position: "bottom-right",
                autoClose: 3000,
                theme: "colored",
            });
        }
    };

// Sipariş silme fonksiyonu
    const handleDeleteOrder = async () => {
        try {
            await apiClient.delete(`${apiUrl.deleteOrder}/${id}`);  // apiClient kullanımı
            toast.success("Sipariş başarıyla silindi", {
                position: "bottom-right",
                autoClose: 3000,
                theme: "colored",
            });
            // Silme işlemi sonrası sayfayı güncelleyebilirsiniz
            window.location.href = "/orders"; // Yönlendirme yapılacak sayfayı buraya ayarlayın
        } catch (error) {
            console.error("Sipariş silinirken hata oluştu:", error);
            toast.error("Sipariş silinirken bir hata oluştu", {
                position: "bottom-right",
                autoClose: 3000,
                theme: "colored",
            });
        }
    };

    if (!id) return null;

    return (
        <div style={{padding: "20px"}}>
            <ToastContainer/>
            <Title level={2}>Sipariş Bilgileri Düzenle</Title>
            <Spin spinning={isLoadingOrder} tip="Sipariş bilgileri yükleniyor...">
                <Card>
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        {/* Müşteri Bilgileri */}
                        <SectionTitle title="Müşteri Bilgileri"/>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item name="customerName" label="Müşteri Adı" rules={[{required: true}]}>
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item name="deliveryAddress" label="Teslimat Adresi" rules={[{required: true}]}>
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item name="customerPhone" label="Müşteri Telefonu">
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item name="customerEmail" label="Müşteri E-posta" rules={[{type: "email"}]}>
                                    <Input/>
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Sipariş Bilgileri */}
                        <SectionTitle title="Sipariş Bilgileri"/>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item name="productName" label="Ürün Adı" rules={[{required: true}]}>
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item name="quantity" label="Miktar" rules={[{type: "number", required: true}]}>
                                    <InputNumber style={{width: "100%"}}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item name="unitPrice" label="Birim Fiyat"
                                           rules={[{type: "number", required: true}]}>
                                    <InputNumber style={{width: "100%"}}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item name="assignedEmployeeId" label="Atanan Çalışan">
                                    <InputNumber style={{width: "100%"}}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item name="priority" label="Öncelik">
                                    <Select>
                                        <Option value="low">Düşük</Option>
                                        <Option value="medium">Orta</Option>
                                        <Option value="high">Yüksek</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item name="isActive" label="Aktif Mi" valuePropName="checked">
                                    <Switch/>
                                </Form.Item>
                            </Col>
                            <Col xs={24}>
                                <Form.Item name="specialInstructions" label="Özel Talimatlar">
                                    <Input.TextArea rows={4}/>
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Butonlar */}
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={8}>
                                <Button type="primary" htmlType="submit" loading={isUpdating} style={{width: "100%"}}>
                                    Güncelle
                                </Button>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Popconfirm
                                    title="Siparişi iptal etmek istediğinize emin misiniz?"
                                    onConfirm={handleCancelOrder}
                                    okText="Evet"
                                    cancelText="Hayır"
                                >
                                    <Button type="default" danger style={{width: "100%"}}>
                                        Siparişi İptal Et
                                    </Button>
                                </Popconfirm>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Popconfirm
                                    title="Siparişi silmek istediğinize emin misiniz?"
                                    onConfirm={handleDeleteOrder}
                                    okText="Evet"
                                    cancelText="Hayır"
                                >
                                    <Button type="default" danger style={{width: "100%"}}>
                                        Siparişi Sil
                                    </Button>
                                </Popconfirm>
                            </Col>
                        </Row>
                    </Form>
                </Card>
            </Spin>
        </div>
    );
};

export default OrderUpdateById;

// Alt bileşenler
const SectionTitle = ({title}: { title: string }) => (
    <Col xs={24}>
        <Typography.Text strong style={{fontSize: "16px", display: "block", marginBottom: "16px"}}>
            {title}
        </Typography.Text>
    </Col>
);
