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

interface Position {
  positionId: number;
  positionName: string;
}

interface DriverLicense {
  id: number;
  name: string;
}

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "0+", "0-"];
const educationLevels = [
  "İlkokul",
  "Ortaokul",
  "Lise",
  "Önlisans",
  "Lisans",
  "Yüksek Lisans",
  "Doktora",
];
const shiftSchedules = ["Gündüz", "Gece", "Karma"];

const PersonCreateScreen = memo(() => {
  const [form] = Form.useForm();
  const [positions, setPositions] = useState<Position[]>([]);
  const [driverLicenses] = useState<DriverLicense[]>([
    { id: 1, name: "A1" }, // Motosiklet (50cc'ye kadar)
    { id: 2, name: "A2" }, // Motosiklet (50cc-125cc arası)
    { id: 3, name: "A" }, // Motosiklet (125cc üstü)
    { id: 4, name: "B1" }, // Traktör
    { id: 5, name: "B" }, // Otomobil, Kamyonet
    { id: 6, name: "C1" }, // Kamyon (3500 kg'a kadar)
    { id: 7, name: "C" }, // Kamyon (3500 kg üzeri)
    { id: 8, name: "D1" }, // Minibüs (16 kişiye kadar)
    { id: 9, name: "D" }, // Otobüs (16 kişiden fazla)
    { id: 10, name: "F" }, // Motorlu bisiklet
    { id: 11, name: "G" }, // TCDD ve özel demiryolu araçları
    { id: 12, name: "H" }, // Orta büyüklükteki inşaat makineleri
    { id: 13, name: "M" }, // Çift tekerlekli elektrikli bisiklet
    { id: 14, name: "E" }, // Sınırsız motorlu taşıma araçları (Ticari taşımacılık)
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
    fetchPositions();
  }, []);

  const onFinish = async (values: any) => {
    try {
      const response = await axios.post(apiUrl.createPerson, values);
      toast.success("Personel başarıyla oluşturuldu", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        rtl: false,
        pauseOnFocusLoss: true,
        draggable: true,
        pauseOnHover: true,
        theme: "colored",
      });
      form.resetFields();
    } catch (error) {
      console.error("Error creating person:", error);
      toast.error("Personel oluşturulurken bir hata oluştu", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  return (
    <>
      <div style={{ padding: "20px" }}>
        <ToastContainer />

        <Title level={2}>Yeni Personel Oluştur</Title>

        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              isActive: true,
              hasDriverLicense: false,
              hasHealthInsurance: false,
              vacationDays: 0,
            }}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="firstName"
                  label="Ad"
                  rules={[{ required: true, message: "Lütfen adı giriniz" }]}
                >
                  <Input maxLength={50} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="lastName"
                  label="Soyad"
                  rules={[{ required: true, message: "Lütfen soyadı giriniz" }]}
                >
                  <Input maxLength={50} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="identityNumber"
                  label="TC Kimlik No"
                  rules={[
                    { required: true, message: "Lütfen TC kimlik no giriniz" },
                  ]}
                >
                  <Input maxLength={11} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="birthDate" label="Doğum Tarihi">
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="phoneNumber" label="Telefon">
                  <Input maxLength={15} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { type: "email", message: "Geçerli bir email giriniz" },
                  ]}
                >
                  <Input maxLength={100} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="hireDate"
                  label="İşe Giriş Tarihi"
                  rules={[
                    {
                      required: true,
                      message: "Lütfen işe giriş tarihini giriniz",
                    },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="terminationDate" label="İşten Çıkış Tarihi">
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="department" label="Departman">
                  <Input maxLength={50} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="positionId"
                  label="Pozisyon"
                  rules={[
                    { required: true, message: "Lütfen pozisyon seçiniz" },
                  ]}
                >
                  <Select
                    showSearch
                    placeholder="Pozisyon seçiniz"
                    optionFilterProp="children"
                    filterOption={(input: string, option: any) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={positions.map((pos) => ({
                      value: pos.positionId,
                      label: pos.positionName,
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="salary" label="Maaş">
                  <InputNumber
                    style={{ width: "100%" }}
                    formatter={(value) =>
                      `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value!.replace(/₺\s?|(,*)/g, "")}
                  />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item name="address" label="Adres">
                  <Input.TextArea maxLength={200} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item name="bloodType" label="Kan Grubu">
                  <Select placeholder="Kan grubu seçiniz">
                    {bloodTypes.map((type) => (
                      <Option key={type} value={type}>
                        {type}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item name="emergencyContact" label="Acil Durum Kişisi">
                  <Input maxLength={100} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item name="emergencyPhone" label="Acil Durum Telefonu">
                  <Input maxLength={15} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item name="educationLevel" label="Eğitim Seviyesi">
                  <Select placeholder="Eğitim seviyesi seçiniz">
                    {educationLevels.map((level) => (
                      <Option key={level} value={level}>
                        {level}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="isActive"
                  label="Aktif"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="hasDriverLicense"
                  label="Sürücü Belgesi"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.hasDriverLicense !==
                    currentValues.hasDriverLicense
                  }
                >
                  {({ getFieldValue }) =>
                    getFieldValue("hasDriverLicense") ? (
                      <Form.Item
                        name="driverLicenseType"
                        label="Ehliyet Sınıfı"
                        rules={[
                          {
                            required: true,
                            message: "Lütfen ehliyet sınıfı seçiniz",
                          },
                        ]}
                      >
                        <Select
                          placeholder="Ehliyet sınıfı seçiniz"
                          options={driverLicenses.map((license) => ({
                            value: license.name,
                            label: license.name,
                          }))}
                        />
                      </Form.Item>
                    ) : null
                  }
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="hasHealthInsurance"
                  label="Sağlık Sigortası"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item name="lastHealthCheck" label="Son Sağlık Kontrolü">
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item name="shiftSchedule" label="Vardiya Programı">
                  <Select placeholder="Vardiya seçiniz">
                    {shiftSchedules.map((shift) => (
                      <Option key={shift} value={shift}>
                        {shift}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item name="vacationDays" label="İzin Günleri">
                  <InputNumber style={{ width: "100%" }} min={0} />
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
    </>
  );
});

export default PersonCreateScreen;
