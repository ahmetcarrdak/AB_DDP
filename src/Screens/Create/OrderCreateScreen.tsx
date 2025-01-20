import React, { memo, useState } from "react";
import {
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  Switch,
  Button,
  Card,
  Row,
  Col,
  Typography,
} from "antd";
import axios from "axios";
import { apiUrl } from "../../Settings";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const orderStatuses = [
  "Beklemede",
  "Onaylandı",
  "Hazırlanıyor",
  "Kargoya Verildi",
  "Teslim Edildi",
  "İptal Edildi",
];

const paymentMethods = ["Kredi Kartı", "Nakit", "Havale/EFT", "Kapıda Ödeme"];

const paymentStatuses = [
  "Beklemede",
  "Onaylandı",
  "İptal Edildi",
  "İade Edildi",
];

const priorities = ["Düşük", "Normal", "Yüksek", "Acil"];

const orderSources = ["Web", "Telefon", "Mağaza", "Mobil Uygulama"];

const OrderCreateScreen = memo(() => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const formattedValues = {
        ...values,
        orderDate: values.orderDate?.toISOString(),
        estimatedDeliveryDate: values.estimatedDeliveryDate?.toISOString(),
        actualDeliveryDate: values.actualDeliveryDate?.toISOString(),
        cancellationDate: values.cancellationDate?.toISOString(),
      };

      const response = await axios.post(apiUrl.createOrder, formattedValues);
      toast.success("Sipariş başarıyla oluşturuldu", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnFocusLoss: true,
        draggable: true,
        pauseOnHover: true,
        theme: "colored",
      });
      form.resetFields();
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Sipariş oluşturulurken bir hata oluştu", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  const currencyParser = (value: string | undefined): number => {
    if (value) {
      const normalized = value.replace(/₺\s?|(,*)/g, "");
      return parseFloat(normalized) || 0;
    }
    return 0;
  };

  return (
    <div style={{ padding: "20px" }}>
      <ToastContainer />
      <Title level={2}>Yeni Sipariş Oluştur</Title>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            isActive: true,
            isPaid: false,
            orderStatus: "Beklemede",
            paymentStatus: "Beklemede",
            priority: "Normal",
          }}
        >
          <Row gutter={16}>
            {/* Müşteri Bilgileri */}
            <Col xs={24}>
              <Title level={4}>Müşteri Bilgileri</Title>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="customerName"
                label="Müşteri Adı"
                rules={[{ required: true, message: "Müşteri adı zorunludur" }]}
              >
                <Input maxLength={100} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="customerPhone"
                label="Telefon"
                rules={[{ required: true, message: "Telefon zorunludur" }]}
              >
                <Input maxLength={15} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="customerEmail"
                label="Email"
                rules={[
                  { type: "email", message: "Geçerli bir email giriniz" },
                ]}
              >
                <Input maxLength={100} />
              </Form.Item>
            </Col>

            {/* Sipariş Detayları */}
            <Col xs={24}>
              <Title level={4}>Sipariş Detayları</Title>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="productName"
                label="Ürün Adı"
                rules={[{ required: true, message: "Ürün adı zorunludur" }]}
              >
                <Input maxLength={100} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="quantity"
                label="Miktar"
                rules={[{ required: true, message: "Miktar zorunludur" }]}
              >
                <InputNumber style={{ width: "100%" }} min={1} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="unitPrice"
                label="Birim Fiyat"
                rules={[{ required: true, message: "Birim fiyat zorunludur" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  formatter={(value) =>
                    `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={currencyParser}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item name="discountAmount" label="İndirim Tutarı">
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  formatter={(value) =>
                    `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={currencyParser}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item name="taxAmount" label="Vergi Tutarı">
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  formatter={(value) =>
                    `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={currencyParser}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item name="invoiceNumber" label="Fatura Numarası">
                <Input maxLength={50} />
              </Form.Item>
            </Col>

            {/* Teslimat Bilgileri */}
            <Col xs={24}>
              <Title level={4}>Teslimat Bilgileri</Title>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="deliveryAddress"
                label="Teslimat Adresi"
                rules={[
                  { required: true, message: "Teslimat adresi zorunludur" },
                ]}
              >
                <TextArea rows={4} maxLength={500} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="orderDate"
                label="Sipariş Tarihi"
                rules={[
                  { required: true, message: "Sipariş tarihi zorunludur" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} showTime />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="estimatedDeliveryDate"
                label="Tahmini Teslimat Tarihi"
              >
                <DatePicker style={{ width: "100%" }} showTime />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="actualDeliveryDate"
                label="Gerçek Teslimat Tarihi"
              >
                <DatePicker style={{ width: "100%" }} showTime />
              </Form.Item>
            </Col>

            {/* Durum ve Ödeme */}
            <Col xs={24}>
              <Title level={4}>Durum ve Ödeme Bilgileri</Title>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="orderStatus"
                label="Sipariş Durumu"
                rules={[
                  { required: true, message: "Sipariş durumu zorunludur" },
                ]}
              >
                <Select>
                  {orderStatuses.map((status) => (
                    <Option key={status} value={status}>
                      {status}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="paymentMethod"
                label="Ödeme Yöntemi"
                rules={[
                  { required: true, message: "Ödeme yöntemi zorunludur" },
                ]}
              >
                <Select>
                  {paymentMethods.map((method) => (
                    <Option key={method} value={method}>
                      {method}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item name="paymentStatus" label="Ödeme Durumu">
                <Select>
                  {paymentStatuses.map((status) => (
                    <Option key={status} value={status}>
                      {status}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item name="isPaid" label="Ödendi" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>

            {/* Diğer Bilgiler */}
            <Col xs={24}>
              <Title level={4}>Diğer Bilgiler</Title>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item name="priority" label="Öncelik">
                <Select>
                  {priorities.map((priority) => (
                    <Option key={priority} value={priority}>
                      {priority}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item name="orderSource" label="Sipariş Kaynağı">
                <Select>
                  {orderSources.map((source) => (
                    <Option key={source} value={source}>
                      {source}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item name="assignedEmployeeId" label="Atanan Personel ID">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item name="isActive" label="Aktif" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item name="specialInstructions" label="Özel Talimatlar">
                <TextArea rows={4} maxLength={500} />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item name="cancellationReason" label="İptal Nedeni">
                <TextArea rows={4} maxLength={500} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Sipariş Oluştur
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
});

export default OrderCreateScreen;
