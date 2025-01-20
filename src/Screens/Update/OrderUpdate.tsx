import React, { useState, useEffect } from "react";
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
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { apiUrl } from "../../Settings";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Order {
  orderId: number;
  customerName: string;
}

interface OrderDetails {
  orderId: number;
  orderDate: string | null;
  customerName: string;
  deliveryAddress: string;
  customerPhone: string;
  customerEmail: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  orderStatus: string;
  estimatedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  paymentMethod: string;
  isPaid: boolean;
  paymentStatus: string;
  assignedEmployeeId: number;
  specialInstructions: string;
  priority: string;
  isActive: boolean;
  cancellationReason: string;
  cancellationDate: string | null;
  orderSource: string;
  discountAmount: number;
  taxAmount: number;
  invoiceNumber: string;
}

const OrderUpdate = () => {
  const [form] = Form.useForm();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${apiUrl.order}`);
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Sipariş listesi yüklenirken bir hata oluştu", {
          position: "bottom-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!selectedOrderId) return;

      setIsLoadingDetails(true);
      try {
        const response = await axios.get(`${apiUrl.orderById}/${selectedOrderId}`);
        const data = response.data;

        const updatedData = {
          ...data,
          orderDate: data.orderDate ? dayjs(data.orderDate) : null,
          estimatedDeliveryDate: data.estimatedDeliveryDate ? dayjs(data.estimatedDeliveryDate) : null,
          actualDeliveryDate: data.actualDeliveryDate ? dayjs(data.actualDeliveryDate) : null,
          cancellationDate: data.cancellationDate ? dayjs(data.cancellationDate) : null,
        };

        setOrderDetails(updatedData);
        form.setFieldsValue(updatedData);
      } catch (error) {
        console.error("Error fetching order details:", error);
        toast.error("Sipariş bilgileri yüklenirken bir hata oluştu", {
          position: "bottom-right",
          autoClose: 3000,
          theme: "colored",
        });
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchOrderDetails();
  }, [selectedOrderId, form]);

  const onFinish = async (values: any) => {
    setIsUpdating(true);
    try {
      const formattedValues = {
        ...values,
        orderDate: values.orderDate ? values.orderDate.toISOString() : null,
        estimatedDeliveryDate: values.estimatedDeliveryDate ? values.estimatedDeliveryDate.toISOString() : null,
        actualDeliveryDate: values.actualDeliveryDate ? values.actualDeliveryDate.toISOString() : null,
        cancellationDate: values.cancellationDate ? values.cancellationDate.toISOString() : null,
      };

      await axios.put(`${apiUrl.orderUpdate}/${selectedOrderId}`, formattedValues);
      toast.success("Sipariş başarıyla güncellendi", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Sipariş güncellenirken bir hata oluştu", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOrderSelect = (value: number) => {
    setSelectedOrderId(value);
    form.resetFields();
  };

  return (
    <div className="order-update-page">
      <ToastContainer />
      <Title level={2}>Sipariş Bilgileri Düzenle</Title>

      <Card style={{ marginBottom: 16 }}>
        <Form.Item label="Sipariş Seç" required>
          <Select
            showSearch
            style={{ width: "100%" }}
            placeholder="Sipariş ara..."
            optionFilterProp="children"
            onChange={handleOrderSelect}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={orders.map((order) => ({
              value: order.orderId,
              label: `${order.orderId} - ${order.customerName}`,
            }))}
          />
        </Form.Item>
      </Card>

      {selectedOrderId && (
        <Spin spinning={isLoadingDetails} tip="Sipariş bilgileri yükleniyor...">
          <Card>
            {orderDetails && (
              <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="orderId" hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item name="customerName" label="Müşteri Adı" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="customerEmail" label="Müşteri E-posta" rules={[{ type: "email" }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="customerPhone" label="Müşteri Telefonu">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="productName" label="Ürün Adı" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="quantity" label="Miktar" rules={[{ type: "number", required: true }]}>
                      <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="unitPrice" label="Birim Fiyat" rules={[{ type: "number", required: true }]}>
                      <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="orderStatus" label="Sipariş Durumu">
                      <Select>
                        <Option value="pending">Beklemede</Option>
                        <Option value="processing">İşleniyor</Option>
                        <Option value="shipped">Kargoda</Option>
                        <Option value="delivered">Teslim Edildi</Option>
                        <Option value="cancelled">İptal Edildi</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="orderDate" label="Sipariş Tarihi">
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="estimatedDeliveryDate" label="Tahmini Teslimat Tarihi">
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="actualDeliveryDate" label="Gerçek Teslimat Tarihi">
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="paymentMethod" label="Ödeme Yöntemi">
                      <Select>
                        <Option value="credit_card">Kredi Kartı</Option>
                        <Option value="bank_transfer">Banka Transferi</Option>
                        <Option value="cash">Nakit</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="isPaid" label="Ödendi Mi" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="paymentStatus" label="Ödeme Durumu">
                      <Select>
                        <Option value="pending">Beklemede</Option>
                        <Option value="completed">Tamamlandı</Option>
                        <Option value="failed">Başarısız</Option>
                        <Option value="refunded">İade Edildi</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="assignedEmployeeId" label="Atanan Çalışan ID">
                      <InputNumber style={{ width: "100%" }} />
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
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="orderSource" label="Sipariş Kaynağı">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="discountAmount" label="İndirim Tutarı">
                      <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="taxAmount" label="Vergi Tutarı">
                      <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="invoiceNumber" label="Fatura Numarası">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item name="deliveryAddress" label="Teslimat Adresi">
                      <TextArea rows={4} />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item name="specialInstructions" label="Özel Talimatlar">
                      <TextArea rows={4} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="cancellationReason" label="İptal Nedeni">
                      <TextArea rows={4} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="cancellationDate" label="İptal Tarihi">
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item>
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        block
                        loading={isUpdating}
                      >
                        {isUpdating ? 'Güncelleniyor...' : 'Kaydet'}
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            )}
          </Card>
        </Spin>
      )}
    </div>
  );
};

export default OrderUpdate;