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

interface Position {
  positionId: number;
  positionName: string;
}

interface Person {
  id: number;
  firstName: string;
  lastName: string;
}

interface PersonDetails {
  id: number;
  phoneNumber: string;
  email: string;
  terminationDate: string | null;
  department: string;
  positionId: number;
  salary: number;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  educationLevel: string;
  isActive: boolean;
  hasDriverLicense: boolean;
  driverLicenseType?: string;
  hasHealthInsurance: boolean;
  lastHealthCheck: string | null;
  shiftSchedule: string;
  vacationDays: number;
  notes: string;
}

interface DriverLicense {
  id: number;
  name: string;
}

const PersonUpdate = () => {
  const [form] = Form.useForm();
  const [positions, setPositions] = useState<Position[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const [personDetails, setPersonDetails] = useState<PersonDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [driverLicenses] = useState<DriverLicense[]>([
    { id: 1, name: "A1" },
    { id: 2, name: "A2" },
    { id: 3, name: "A" },
    { id: 4, name: "B1" },
    { id: 5, name: "B" },
    { id: 6, name: "C1" },
    { id: 7, name: "C" },
    { id: 8, name: "D1" },
    { id: 9, name: "D" },
    { id: 10, name: "F" },
    { id: 11, name: "G" },
    { id: 12, name: "H" },
    { id: 13, name: "M" },
    { id: 14, name: "E" },
  ]);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await axios.get(`${apiUrl.positions}`);
        setPositions(response.data);
      } catch (error) {
        console.error("Error fetching positions:", error);
        toast.error("Pozisyonlar yüklenirken bir hata oluştu", {
          position: "bottom-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    };

    const fetchPeople = async () => {
      try {
        const response = await axios.get(`${apiUrl.person}`);
        setPeople(response.data);
      } catch (error) {
        console.error("Error fetching people:", error);
        toast.error("Personel listesi yüklenirken bir hata oluştu", {
          position: "bottom-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    };

    fetchPositions();
    fetchPeople();
  }, []);

  useEffect(() => {
    const fetchPersonDetails = async () => {
      if (!selectedPersonId) return;

      setIsLoadingDetails(true);
      try {
        const response = await axios.get(
          `${apiUrl.personById}/${selectedPersonId}`
        );
        const data = response.data;

        const updatedData = {
          ...data,
          lastHealthCheck: data.lastHealthCheck
            ? dayjs(data.lastHealthCheck)
            : null,
          terminationDate: data.terminationDate
            ? dayjs(data.terminationDate)
            : null,
        };

        setPersonDetails(updatedData);
        form.setFieldsValue(updatedData);
      } catch (error) {
        console.error("Error fetching person details:", error);
        toast.error("Personel bilgileri yüklenirken bir hata oluştu", {
          position: "bottom-right",
          autoClose: 3000,
          theme: "colored",
        });
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchPersonDetails();
  }, [selectedPersonId, form]);

  const onFinish = async (values: any) => {
    setIsUpdating(true);
    try {
      const formattedValues = {
        ...values,
        terminationDate: values.terminationDate
          ? values.terminationDate.toISOString()
          : null,
        lastHealthCheck: values.lastHealthCheck
          ? values.lastHealthCheck.toISOString()
          : null,
      };

      await axios.put(`${apiUrl.personUpdate}`, formattedValues);
      toast.success("Personel başarıyla güncellendi", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
    } catch (error) {
      console.error("Error updating person:", error);
      toast.error("Personel güncellenirken bir hata oluştu", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const onDriverLicenseSwitchChange = (checked: boolean) => {
    form.setFieldsValue({
      hasDriverLicense: checked,
      driverLicenseType: checked
        ? form.getFieldValue("driverLicenseType")
        : undefined,
    });
  };

  const handlePersonSelect = (value: number) => {
    setSelectedPersonId(value);
    form.resetFields();
  };

  return (
    <div className="person-update-page">
      <ToastContainer />
      <Title level={2}>Personel Bilgileri Düzenle</Title>

      <Card style={{ marginBottom: 16 }}>
        <Form.Item label="Personel Seç" required>
          <Select
            showSearch
            style={{ width: "100%" }}
            placeholder="Personel ara..."
            optionFilterProp="children"
            onChange={handlePersonSelect}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={people.map((person) => ({
              value: person.id,
              label: `${person.firstName} ${person.lastName}`,
            }))}
          />
        </Form.Item>
      </Card>

      {selectedPersonId && (
        <Spin spinning={isLoadingDetails} tip="Personel bilgileri yükleniyor...">
          <Card>
            {personDetails && (
              <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={16}>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="phoneNumber" label="Telefon Numarası">
                      <Input />
                    </Form.Item>
                    <Form.Item name="id" hidden>
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="vacationDays" label="Yıllık izin sayısı">
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="shiftSchedule" label="Vardiya tipi">
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="email" label="E-posta">
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="department" label="Departman">
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="positionId" label="Pozisyon">
                      <Select>
                        {positions.map((position) => (
                          <Option
                            key={position.positionId}
                            value={position.positionId}
                          >
                            {position.positionName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="salary" label="Maaş">
                      <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="address" label="Adres">
                      <Input.TextArea rows={2} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="emergencyContact" label="Acil İletişim">
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="emergencyPhone" label="Acil İletişim Telefon">
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="educationLevel" label="Eğitim Seviyesi">
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="isActive" label="Aktif" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      name="hasDriverLicense"
                      label="Ehliyet Durumu"
                      valuePropName="checked"
                    >
                      <Switch onChange={onDriverLicenseSwitchChange} />
                    </Form.Item>
                  </Col>

                  {form.getFieldValue("hasDriverLicense") && (
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item name="driverLicenseType" label="Ehliyet Tipi">
                        <Select>
                          {driverLicenses.map((license) => (
                            <Option key={license.id} value={license.name}>
                              {license.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  )}

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      name="hasHealthInsurance"
                      label="Sağlık Sigortası"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="lastHealthCheck" label="Son Sağlık Kontrolü">
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="terminationDate" label="İşten Çıkış Tarihi">
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Form.Item name="notes" label="Notlar">
                      <Input.TextArea rows={4} />
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

export default PersonUpdate;