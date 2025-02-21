import React, { memo } from "react";
import {
  Form,
  Input,
  DatePicker,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Select,
} from "antd";
import axios from "axios";
import { apiUrl } from "../../Settings";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Test types
const testTypes = [
  "Boyutsal Kontrol",
  "Görsel Kontrol",
  "Fonksiyonel Test",
  "Malzeme Analizi",
  "Performans Testi",
  "Dayanıklılık Testi",
  "Kimyasal Analiz",
  "Elektriksel Test",
];

// Test results
const testResults = [
  "Başarılı",
  "Başarısız",
  "Şartlı Kabul",
  "Yeniden Test Gerekli",
  "Değerlendirmede",
];

const QualityControlAddScreen = memo(() => {
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      const qualityControlData = {
        ...values,
        testDate: values.testDate.toISOString(),
      };

      await axios.post(apiUrl.createQualityControl, qualityControlData);
      toast.success("Kalite kontrol kaydı başarıyla oluşturuldu", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
      form.resetFields();
    } catch (error) {
      console.error("Error creating quality control record:", error);
      toast.error("Kalite kontrol kaydı oluşturulurken bir hata oluştu", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <ToastContainer />
      <Title level={2}>Yeni Kalite Kontrol Kaydı</Title>
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            testDate: null,
          }}
        >
          {/* Temel Bilgiler */}
          <SectionTitle title="Temel Bilgiler" />
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="productId"
                label="Ürün No"
                rules={[
                  { required: true, message: "Lütfen ürün numarasını giriniz" },
                ]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="testType"
                label="Test Türü"
                rules={[
                  { required: true, message: "Lütfen test türünü seçiniz" },
                ]}
              >
                <Select placeholder="Test türü seçiniz">
                  {testTypes.map((type) => (
                    <Option key={type} value={type}>
                      {type}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="testDate"
                label="Test Tarihi"
                rules={[
                  { required: true, message: "Lütfen test tarihini seçiniz" },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Test Sonuçları */}
          <SectionTitle title="Test Sonuçları" />
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="testResult"
                label="Test Sonucu"
                rules={[
                  { required: true, message: "Lütfen test sonucunu seçiniz" },
                ]}
              >
                <Select placeholder="Test sonucunu seçiniz">
                  {testResults.map((result) => (
                    <Option key={result} value={result}>
                      {result}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="testedBy"
                label="Test Eden"
                rules={[
                  {
                    required: true,
                    message: "Lütfen test eden kişiyi giriniz",
                  },
                ]}
              >
                <Input maxLength={100} />
              </Form.Item>
            </Col>
          </Row>

          {/* Detaylı Bilgiler */}
          <SectionTitle title="Detaylı Bilgiler" />
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item name="comments" label="Yorumlar ve Notlar">
                <TextArea
                  rows={4}
                  maxLength={500}
                  placeholder="Test sırasında yapılan gözlemler, özel durumlar veya takip edilmesi gereken noktalar..."
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Kaydet Butonu */}
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Kaydet
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
});

// Alt bileşenler
const SectionTitle = ({ title }: { title: string }) => (
  <Col xs={24}>
    <Text
      strong
      style={{ fontSize: "16px", display: "block", marginBottom: "16px" }}
    >
      {title}
    </Text>
  </Col>
);

export default QualityControlAddScreen;
