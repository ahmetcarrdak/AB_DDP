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

const { Title } = Typography;
const { Option } = Select;

// Type definitions to resolve TypeScript errors
interface Department {
  departmentId: number;
  departmentName: string;
}

interface Person {
  id: number;
  firstName: string;
  lastName: string;
}

const workStatuses = ["Pending", "In Progress", "Completed", "Cancelled"];
const workPriorities = ["Low", "Medium", "High", "Critical"];

const WorkCreateScreen = memo(() => {
  const [form] = Form.useForm();
  const [persons, setPersons] = useState<Person[]>([]);

  useEffect(() => {
    const fetchDepartmentsAndPersons = async () => {
      try {
        const personsResponse = await axios.get(`${apiUrl.person}`);

        setPersons(personsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Veriler yüklenirken bir hata oluştu", {
          position: "bottom-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    };
    fetchDepartmentsAndPersons();
  }, []);

  const onFinish = async (values: any) => {
    try {
      const response = await axios.post(apiUrl.createWork, values);
      toast.success("İş başarıyla oluşturuldu", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
      form.resetFields();
    } catch (error) {
      console.error("Error creating work:", error);
      toast.error("İş oluşturulurken bir hata oluştu", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <ToastContainer />

      <Title level={2}>Yeni İş Oluştur</Title>

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
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="workName"
                label="İş Adı"
                rules={[{ required: true, message: "Lütfen iş adını giriniz" }]}
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
              <Form.Item name="startDate" label="Başlangıç Tarihi">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item name="dueDate" label="Bitiş Tarihi">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item name="status" label="Durum">
                <Select placeholder="Durum seçiniz">
                  {workStatuses.map((status) => (
                    <Option key={status} value={status}>
                      {status}
                    </Option>
                  ))}
                </Select>
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
 
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="assignedEmployeeId" label="Çalışan">
                <Select
                  placeholder="Çalışan seçiniz"
                  options={persons.map((person) => ({
                    value: person.id,
                    label: `${person.firstName} ${person.lastName}`,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item name="location" label="Lokasyon">
                <Input maxLength={100} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item name="estimatedCost" label="Tahmini Maliyet">
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value!.replace(/₺\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item name="estimatedDuration" label="Tahmini Süre (Saat)">
                <InputNumber style={{ width: "100%" }} min={0} />
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

            <Col xs={24} sm={12} md={4}>
              <Form.Item name="isActive" label="Aktif" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={4}>
              <Form.Item
                name="isRecurring"
                label="Tekrarlanan İş"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={4}>
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

            <Col xs={24} sm={12} md={4}>
              <Form.Item
                name="requiresApproval"
                label="Onay Gerekli"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={4}>
              <Form.Item
                name="hasSafetyRisks"
                label="Güvenlik Riski"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item name="notes" label="Notlar">
                <Input.TextArea maxLength={500} />
              </Form.Item>
            </Col>
          </Row>

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
