import React, { useState, useEffect } from "react";
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
  Spin,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { apiUrl } from "../../Settings";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Title } = Typography;
const { Option } = Select;

interface Work {
  workId: number;
  workName: string;
}

interface WorkDetails {
  workId: number;
  workName: string;
  description: string;
  createdDate: string;
  startDate: string;
  dueDate: string;
  completionDate?: string | null;
  status: string;
  priority: string;
  assignedDepartmentId: number;
  assignedEmployeeId: number;
  location: string;
  estimatedCost: number;
  actualCost: number;
  estimatedDuration: number;
  actualDuration: number;
  requiredEquipment: string;
  requiredMaterials: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  requiresApproval: boolean;
  notes?: string;
  isActive: boolean;
  cancellationReason?: string;
  cancellationDate?: string | null;
  qualityScore?: number;
  qualityNotes?: string;
  hasSafetyRisks: boolean;
  safetyNotes?: string;
}

const WorkUpdate = () => {
  const [form] = Form.useForm();
  const [works, setWorks] = useState<Work[]>([]);
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(null);
  const [workDetails, setWorkDetails] = useState<WorkDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions = [
    "Planned",
    "In Progress",
    "On Hold",
    "Completed",
    "Cancelled",
  ];

  const priorityOptions = ["Low", "Medium", "High", "Critical"];

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const response = await axios.get(`${apiUrl.work}`);
        setWorks(response.data);
      } catch (error) {
        console.error("Error fetching works:", error);
        toast.error("İş listesi yüklenirken bir hata oluştu", {
          position: "bottom-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    };

    fetchWorks();
  }, []);

  useEffect(() => {
    const fetchWorkDetails = async () => {
      if (!selectedWorkId) return;

      setIsLoadingDetails(true);
      try {
        const response = await axios.get(
          `${apiUrl.workById}/${selectedWorkId}`
        );
        const data = response.data;

        const updatedData = {
          ...data,
          startDate: data.startDate ? dayjs(data.startDate) : null,
          dueDate: data.dueDate ? dayjs(data.dueDate) : null,
          completionDate: data.completionDate
            ? dayjs(data.completionDate)
            : null,
          cancellationDate: data.cancellationDate
            ? dayjs(data.cancellationDate)
            : null,
        };

        setWorkDetails(updatedData);
        form.setFieldsValue(updatedData);
      } catch (error) {
        console.error("Error fetching work details:", error);
        toast.error("İş bilgileri yüklenirken bir hata oluştu", {
          position: "bottom-right",
          autoClose: 3000,
          theme: "colored",
        });
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchWorkDetails();
  }, [selectedWorkId, form]);

  const onFinish = async (values: any) => {
    setIsUpdating(true);
    try {
      const formattedValues = {
        ...values,
        startDate: values.startDate ? values.startDate.toISOString() : null,
        dueDate: values.dueDate ? values.dueDate.toISOString() : null,
        completionDate: values.completionDate
          ? values.completionDate.toISOString()
          : null,
        cancellationDate: values.cancellationDate
          ? values.cancellationDate.toISOString()
          : null,
      };

      await axios.put(`${apiUrl.workUpdate}/${selectedWorkId}`, formattedValues);
      toast.success("İş başarıyla güncellendi", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
    } catch (error) {
      console.error("Error updating work:", error);
      toast.error("İş güncellenirken bir hata oluştu", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleWorkSelect = (value: number) => {
    setSelectedWorkId(value);
    form.resetFields();
  };

  return (
    <div className="work-update-page">
      <ToastContainer />
      <Title level={2}>İş Bilgileri Düzenle</Title>

      <Card style={{ marginBottom: 16 }}>
        <Form.Item label="İş Seç" required>
          <Select
            showSearch
            style={{ width: "100%" }}
            placeholder="İş ara..."
            optionFilterProp="children"
            onChange={handleWorkSelect}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={works.map((work) => ({
              value: work.workId,
              label: work.workName,
            }))}
          />
        </Form.Item>
      </Card>

      {selectedWorkId && (
        <Spin spinning={isLoadingDetails} tip="İş bilgileri yükleniyor...">
          <Card>
            {workDetails && (
              <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={16}>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="workId" hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name="workName"
                      label="İş Adı"
                      rules={[{ required: true }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="status" label="Durum">
                      <Select>
                        {statusOptions.map((status) => (
                          <Option key={status} value={status}>
                            {status}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="priority" label="Öncelik">
                      <Select>
                        {priorityOptions.map((priority) => (
                          <Option key={priority} value={priority}>
                            {priority}
                          </Option>
                        ))}
                      </Select>
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
                    <Form.Item name="completionDate" label="Tamamlanma Tarihi">
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="location" label="Konum">
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="estimatedCost" label="Tahmini Maliyet">
                      <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="actualCost" label="Gerçek Maliyet">
                      <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      name="estimatedDuration"
                      label="Tahmini Süre (saat)"
                    >
                      <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="actualDuration" label="Gerçek Süre (saat)">
                      <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="requiredEquipment" label="Gerekli Ekipman">
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      name="requiredMaterials"
                      label="Gerekli Malzemeler"
                    >
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      name="isRecurring"
                      label="Tekrarlanan İş"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>

                  {form.getFieldValue("isRecurring") && (
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        name="recurrencePattern"
                        label="Tekrar Sıklığı"
                      >
                        <Input placeholder="Örn: Haftalık, Aylık" />
                      </Form.Item>
                    </Col>
                  )}

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      name="requiresApproval"
                      label="Onay Gerekiyor"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      name="isActive"
                      label="Aktif"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      name="hasSafetyRisks"
                      label="Güvenlik Riski"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>

                  {form.getFieldValue("hasSafetyRisks") && (
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item name="safetyNotes" label="Güvenlik Notları">
                        <Input.TextArea rows={2} />
                      </Form.Item>
                    </Col>
                  )}

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="description" label="Açıklama">
                      <Input.TextArea rows={3} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="notes" label="Notlar">
                      <Input.TextArea rows={3} />
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={isUpdating}
                      >
                        {isUpdating ? "Güncelleniyor..." : "Kaydet"}
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

export default WorkUpdate;
