import React, { memo, useState, useEffect } from "react";
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

const { Title, Text } = Typography;
const { Option } = Select;

// Type definitions to resolve TypeScript errors
interface Person {
  id: number;
  firstName: string;
  lastName: string;
}

const workPriorities = ["Düşük", "Normal", "Yüksek", "Kritik"];

const WorkCreateScreen = memo(() => {
  const [form] = Form.useForm();
  const [persons, setPersons] = useState<Person[]>([]);

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const personsResponse = await axios.get(`${apiUrl.person}`);
        setPersons(personsResponse.data);
      } catch (error) {
        console.error("Error fetching persons:", error);
        toast.error("ÇalMetaryelanlar yüklenirken bir hata oluştu", {
          position: "bottom-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    };
    fetchPersons();
  }, []);

  const onFinish = async (values: any) => {
    try {
      await axios.post(apiUrl.createWork, values);
      toast.success("Metaryel başarıyla oluşturuldu", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
      form.resetFields();
    } catch (error) {
      console.error("Error creating work:", error);
      toast.error("Metaryel oluşturulurken bir hata oluştu", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  return (
      <div style={{ padding: "20px" }}>
        <ToastContainer />
        <Title level={2}>Yarı Mamül İş Emri Oluştur</Title>
        <Card>
          <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                isActive: true,
                requiresApproval: false,
                isRecurring: false,
                hasSafetyRisks: false,
              }}
          >
            {/* Metaryel Bilgileri */}
            <SectionTitle title="Metaryel Bilgileri" />
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                    name="workName"
                    label="Metaryel Adı"
                    rules={[{ required: true, message: "Lütfen Metaryel adını giriniz" }]}
                >
                  <Input maxLength={100} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="description" label="Açıklama">
                  <Input.TextArea maxLength={500} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="priority" label="Öncelik">
                  <Select placeholder="Öncelik seçiniz">
                    {workPriorities.map((priority) => (
                        <Option key={priority} value={priority}>
                          {priority}
                        </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* ÇalMetaryelan ve Ekipman Bilgileri */}
            <SectionTitle title="ÇalMetaryelan ve Ekipman Bilgileri" />
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="assignedEmployeeId" label="Çalışacak Personel">
                  <Select
                      placeholder="Çalışacak personelleri seçiniz"
                      options={persons.map((person) => ({
                        value: person.id,
                        label: `${person.firstName} ${person.lastName}`,
                      }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="requiredEquipment" label="Gerekli Ekipman">
                  <Input maxLength={200} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="requiredMaterials" label="Gerekli Malzemeler">
                  <Input maxLength={200} />
                </Form.Item>
              </Col>
            </Row>

            {/* Tekrarlanan Metaryel ve Güvenlik Riski */}
            <SectionTitle title="Tekrarlanan Metaryel ve Güvenlik Riski" />
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                    name="isRecurring"
                    label="Tekrarlanan Metaryel"
                    valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) =>
                        prevValues.isRecurring !== currentValues.isRecurring
                    }
                >
                  {({ getFieldValue }) =>
                      getFieldValue("isRecurring") ? (
                          <Form.Item name="recurrencePattern" label="Tekrar Sıklığı">
                            <Select placeholder="Sıklık seçiniz">
                              <Option value="Daily">Günlük</Option>
                              <Option value="Weekly">Haftalık</Option>
                              <Option value="Monthly">Aylık</Option>
                              <Option value="Yearly">Yıllık</Option>
                            </Select>
                          </Form.Item>
                      ) : null
                  }
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                    name="hasSafetyRisks"
                    label="Güvenlik Riski"
                    valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            {/* Notlar */}
            <SectionTitle title="Notlar" />
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item name="notes" label="Notlar">
                  <Input.TextArea maxLength={500} />
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

export default WorkCreateScreen;

// Alt bileşenler
const SectionTitle = ({ title }: { title: string }) => (
    <Col xs={24}>
      <Text strong style={{ fontSize: "16px", display: "block", marginBottom: "16px" }}>
        {title}
      </Text>
    </Col>
);
