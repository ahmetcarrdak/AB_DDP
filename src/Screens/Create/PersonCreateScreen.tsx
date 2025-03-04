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
import {
    bloodTypes,
    educationLevels,
    shiftSchedules,
    driverLicenses,
} from "../../constants"; // Sabitler ayrı bir dosyada
import apiClient from "../../Utils/ApiClient";

const { Title, Text } = Typography;
const { Option } = Select;

interface Position {
    positionId: number;
    positionName: string;
}

const PersonCreateScreen = memo(() => {
    const [form] = Form.useForm();
    const [positions, setPositions] = useState<Position[]>([]);

    useEffect(() => {
        const fetchPositions = async () => {
            try {
                const response = await apiClient.get(`${apiUrl.positions}`);
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
            await apiClient.post(apiUrl.createPerson, values);
            toast.success("Personel başarıyla oluşturuldu", {
                position: "bottom-right",
                autoClose: 3000,
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
                    {/* Kişisel Bilgiler */}
                    <SectionTitle title="Kişisel Bilgiler" />
                    <Row gutter={16}>
                        <PersonalInformationForm />
                    </Row>

                    {/* Şirket Bilgileri */}
                    <SectionTitle title="Şirket Bilgileri" />
                    <Row gutter={16}>
                        <CompanyInformationForm positions={positions} />
                    </Row>

                    {/* Acil Durum Bilgileri */}
                    <SectionTitle title="Acil Durum Bilgileri" />
                    <Row gutter={16}>
                        <EmergencyInformationForm />
                    </Row>

                    {/* Araç Kabiliyeti */}
                    <SectionTitle title="Araç Kabiliyeti" />
                    <Row gutter={16}>
                        <DriverLicenseForm />
                    </Row>

                    {/* Sağlık Bilgileri */}
                    <SectionTitle title="Sağlık Bilgileri" />
                    <Row gutter={16}>
                        <HealthInformationForm />
                    </Row>

                    {/* Notlar */}
                    <SectionTitle title="Notlar" />
                    <Row gutter={16}>
                        <NotesForm />
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

export default PersonCreateScreen;

// Alt bileşenler
const SectionTitle = ({ title }: { title: string }) => (
    <Col xs={24}>
        <Text strong style={{ fontSize: "16px", display: "block", marginBottom: "16px" }}>
            {title}
        </Text>
    </Col>
);

const PersonalInformationForm = () => (
    <>
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
                rules={[{ required: true, message: "Lütfen TC kimlik no giriniz" }]}
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
                rules={[{ type: "email", message: "Geçerli bir email giriniz" }]}
            >
                <Input maxLength={100} />
            </Form.Item>
        </Col>
    </>
);

const departments = [
    "Üretim",
    "Kalite Kontrol",
    "Ar-Ge",
    "Mühendislik",
    "Bakım",
    "Lojistik",
    "Depo",
    "Satın Alma",
    "Planlama",
    "İnsan Kaynakları",
    "Muhasebe",
    "Finans",
    "Bilgi Teknolojileri",
    "Satış",
    "Pazarlama",
    "İş Sağlığı ve Güvenliği",
    "Çevre Yönetimi",
    "Hukuk",
    "Güvenlik",
    "Yönetim",
];

const CompanyInformationForm = ({ positions }: { positions: Position[] }) => (
    <>
        <Col xs={24} sm={12} md={8}>
            <Form.Item
                name="hireDate"
                label="İşe Giriş Tarihi"
                rules={[{ required: true, message: "Lütfen işe giriş tarihini giriniz" }]}
            >
                <DatePicker style={{ width: "100%" }} />
            </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
            <Form.Item
                name="department"
                label="Departman"
                rules={[{ required: true, message: "Lütfen departman seçiniz" }]}
            >
                <Select
                    showSearch
                    placeholder="Departman seçiniz"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                    options={departments.map((dept) => ({
                        value: dept,
                        label: dept,
                    }))}
                />
            </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
            <Form.Item
                name="positionId"
                label="Pozisyon"
                rules={[{ required: true, message: "Lütfen pozisyon seçiniz" }]}
            >
                <Select
                    showSearch
                    placeholder="Pozisyon seçiniz"
                    optionFilterProp="children"
                    filterOption={(input: string, option: any) =>
                        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
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
                    formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(value) => value!.replace(/₺\s?|(,*)/g, "")}
                />
            </Form.Item>
        </Col>
    </>
);

const EmergencyInformationForm = () => (
    <>
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
    </>
);

const DriverLicenseForm = () => (
    <>
        <Col xs={24} sm={12} md={6}>
            <Form.Item name="hasDriverLicense" label="Sürücü Belgesi" valuePropName="checked">
                <Switch />
            </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
            <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                    prevValues.hasDriverLicense !== currentValues.hasDriverLicense
                }
            >
                {({ getFieldValue }) =>
                    getFieldValue("hasDriverLicense") ? (
                        <Form.Item
                            name="driverLicenseType"
                            label="Ehliyet Sınıfı"
                            rules={[{ required: true, message: "Lütfen ehliyet sınıfı seçiniz" }]}
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
    </>
);

const HealthInformationForm = () => (
    <>
        <Col xs={24} sm={12} md={6}>
            <Form.Item name="hasHealthInsurance" label="Sağlık Sigortası" valuePropName="checked">
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
    </>
);

const NotesForm = () => (
    <Col xs={24}>
        <Form.Item name="notes" label="Notlar">
            <Input.TextArea maxLength={500} />
        </Form.Item>
    </Col>
);
