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
import { useParams } from "react-router-dom";

const { Title } = Typography;
const { Option } = Select;

const OrderUpdateById = () => {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) return;

      setIsLoadingOrder(true);
      try {
        const response = await axios.get(`${apiUrl.orderById}/${id}`);
        const data = response.data;

        const updatedData = {
          ...data,
          orderDate: data.orderDate ? dayjs(data.orderDate) : null,
          estimatedDeliveryDate: data.estimatedDeliveryDate ? dayjs(data.estimatedDeliveryDate) : null,
          actualDeliveryDate: data.actualDeliveryDate ? dayjs(data.actualDeliveryDate) : null,
          cancellationDate: data.cancellationDate ? dayjs(data.cancellationDate) : null,
        };

        form.setFieldsValue(updatedData);
      } catch (error) {
        console.error("Error fetching order details:", error);
        toast.error("Sipariş bilgileri yüklenirken bir hata oluştu", {
          position: "bottom-right",
          autoClose: 3000,
          theme: "colored",
        });
      } finally {
        setIsLoadingOrder(false);
      }
    };

    fetchOrderDetails();
  }, [id, form]);

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
      
      await axios.put(`${apiUrl.orderUpdate}/${id}`, formattedValues);
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

  if (!id) return null;

  return (
    <div className="order-update-page">
      <ToastContainer />
      <Title level={2}>Sipariş Bilgileri Düzenle</Title>
      <Spin spinning={isLoadingOrder} tip="Sipariş bilgileri yükleniyor...">
        <Card>
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
                <Form.Item name="deliveryAddress" label="Teslimat Adresi" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="customerPhone" label="Müşteri Telefonu">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="customerEmail" label="Müşteri E-posta" rules={[{ type: "email" }]}>
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
                <Form.Item name="specialInstructions" label="Özel Talimatlar">
                  <Input.TextArea rows={4} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="cancellationReason" label="İptal Nedeni">
                  <Input.TextArea rows={4} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="cancellationDate" label="İptal Tarihi">
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={isUpdating}>
                    Güncelle
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      </Spin>
    </div>
  );
};

export default OrderUpdateById;