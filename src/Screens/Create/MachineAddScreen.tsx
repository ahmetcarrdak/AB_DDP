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
  Switch,
  InputNumber,
} from "antd";
import axios from "axios";
import { apiUrl } from "../../Settings";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Title, Text } = Typography;
const { TextArea } = Input;

// Manufacturer options - you can expand this list
const manufacturers = [
  "Siemens",
  "ABB",
  "Fanuc",
  "Mitsubishi",
  "Haas",
  "DMG MORI",
  "Mazak",
  "Okuma",
  "Diğer",
];

const MachineAddScreen = memo(() => {
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      const machineData = {
        ...values,
        purchaseDate: values.purchaseDate.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalFault: 0, // Initialize with 0 faults
      };

      await axios.post(apiUrl.machine, machineData);
      toast.success("Makine başarıyla oluşturuldu", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
      form.resetFields();
    } catch (error) {
      console.error("Error creating machine:", error);
      toast.error("Makine oluşturulurken bir hata oluştu", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <ToastContainer />
      <Title level={2}>Yeni Makine Ekle</Title>
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            isOperational: true,
          }}
        >
          {/* Temel Bilgiler */}
          <SectionTitle title="Temel Bilgiler" />
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="name"
                label="Makine Adı"
                rules={[
                  { required: true, message: "Lütfen makine adını giriniz" },
                ]}
              >
                <Input maxLength={100} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="code"
                label="Makine Kodu"
                rules={[
                  { required: true, message: "Lütfen makine kodunu giriniz" },
                ]}
              >
                <Input maxLength={50} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="location"
                label="Konum"
                rules={[{ required: true, message: "Lütfen konumu giriniz" }]}
              >
                <Input maxLength={100} />
              </Form.Item>
            </Col>
          </Row>

          {/* Üretici Bilgileri */}
          <SectionTitle title="Üretici Bilgileri" />
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="manufacturer"
                label="Üretici"
                rules={[
                  { required: true, message: "Lütfen üreticiyi giriniz" },
                ]}
              >
                <Input maxLength={100} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="model"
                label="Model"
                rules={[{ required: true, message: "Lütfen modeli giriniz" }]}
              >
                <Input maxLength={100} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="purchaseDate"
                label="Satın Alma Tarihi"
                rules={[
                  {
                    required: true,
                    message: "Lütfen satın alma tarihini seçiniz",
                  },
                ]}
              >
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          {/* Durum Bilgileri */}
          <SectionTitle title="Durum Bilgileri" />
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="isOperational"
                label="Çalışma Durumu"
                valuePropName="checked"
              >
                <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
              </Form.Item>
            </Col>
          </Row>

          {/* Teknik Özellikler */}
          <SectionTitle title="Teknik Özellikler" />
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item name="specifications" label="Teknik Özellikler">
                <TextArea
                  rows={4}
                  maxLength={500}
                  placeholder="Makinenin teknik özellikleri, kapasitesi, güç gereksinimleri vb."
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Bakım Bilgileri */}
          <SectionTitle title="Bakım Bilgileri" />
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item name="maintenanceInfo" label="Bakım Notları">
                <TextArea
                  rows={4}
                  maxLength={500}
                  placeholder="Periyodik bakım gereksinimleri, özel bakım talimatları vb."
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

export default MachineAddScreen;
