import React, {useState, useEffect} from "react";
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
import {apiUrl} from "../../Settings";
import {toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {useParams} from "react-router-dom";
import {DriverLicense, driverLicenses} from "../../constants"; // Sabitler ayrı bir dosyada
import apiClient from "../../Utils/ApiClient";

const {Title} = Typography;
const {Option} = Select;

// Interface'ler ayrı bir dosyada tutulabilir
interface Position {
    positionId: number;
    positionName: string;
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

const PersonUpdateById = () => {
    const {id} = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const [positions, setPositions] = useState<Position[]>([]);
    const [personDetails, setPersonDetails] = useState<PersonDetails | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchPositions = async () => {
            try {
                const response = await apiClient.get(`${apiUrl.positions}`);  // apiClient kullanımı
                setPositions(response.data);
            } catch (error) {
                console.error("Pozisyonlar alınırken hata oluştu:", error);
                toast.error("Pozisyonlar yüklenirken bir hata oluştu", {
                    position: "bottom-right",
                    autoClose: 3000,
                    theme: "colored",
                });
            }
        };

        fetchPositions();
    }, []); // İlk render'da bir kez çalışır

// Personel detaylarını al
    useEffect(() => {
        const fetchPersonDetails = async () => {
            if (!id) return;

            setIsLoadingDetails(true); // Yükleme başladığını belirtiyoruz
            try {
                const url = apiUrl.personById(id); // Örnek: "Person/22"
                const response = await apiClient.get(url); // Doğru URL
                const data = response.data;

                // Verileri düzenleyerek güncellenmiş veri ile formu güncelliyoruz
                const updatedData = {
                    ...data,
                    lastHealthCheck: data.lastHealthCheck ? dayjs(data.lastHealthCheck) : null,
                    terminationDate: data.terminationDate ? dayjs(data.terminationDate) : null,
                };

                setPersonDetails(updatedData);
                form.setFieldsValue(updatedData);
            } catch (error) {
                console.error("Personel bilgileri alınırken hata oluştu:", error);
                toast.error("Personel bilgileri yüklenirken bir hata oluştu", {
                    position: "bottom-right",
                    autoClose: 3000,
                    theme: "colored",
                });
            } finally {
                setIsLoadingDetails(false); // Yükleme bitiyor
            }
        };

        fetchPersonDetails();
    }, [id, form]); // id veya form değiştiğinde bu effect çalışır

// Personel güncelleme fonksiyonu
    const onFinish = async (values: any) => {
        setIsUpdating(true); // Güncelleme işlemi başladığını belirtiyoruz
        try {
            // Tarihleri uygun formata dönüştürüp düzenliyoruz
            const formattedValues = {
                ...values,
                terminationDate: values.terminationDate ? values.terminationDate.toISOString() : null,
                lastHealthCheck: values.lastHealthCheck ? values.lastHealthCheck.toISOString() : null,
            };

            // Personeli güncelliyoruz
            await apiClient.put(`${apiUrl.updatePerson}`, formattedValues); // apiClient kullanımı
            toast.success("Personel başarıyla güncellendi", {
                position: "bottom-right",
                autoClose: 3000,
                theme: "colored",
            });
        } catch (error) {
            console.error("Personel güncellenirken hata oluştu:", error);
            toast.error("Personel güncellenirken bir hata oluştu", {
                position: "bottom-right",
                autoClose: 3000,
                theme: "colored",
            });
        } finally {
            setIsUpdating(false); // Güncelleme işlemi tamamlanıyor
        }
    };
    // Ehliyet durumu değiştiğinde çalışır
    const onDriverLicenseSwitchChange = (checked: boolean) => {
        form.setFieldsValue({
            hasDriverLicense: checked,
            driverLicenseType: checked ? form.getFieldValue("driverLicenseType") : undefined,
        });
    };

    if (!id) return null;

    return (
        <div className="person-update-page">
            <ToastContainer/>
            <Title level={2}>Personel Bilgileri Düzenle</Title>

            <Spin spinning={isLoadingDetails} tip="Personel bilgileri yükleniyor...">
                <Card>
                    {personDetails && (
                        <Form form={form} layout="vertical" onFinish={onFinish}>
                            <ContactInformationForm/>
                            <CompanyInformationForm positions={positions}/>
                            <EmergencyInformationForm/>
                            <DriverLicenseForm
                                driverLicenses={driverLicenses}
                                onDriverLicenseSwitchChange={onDriverLicenseSwitchChange}
                                form={form}
                            />
                            <HealthInformationForm/>
                            <FormButtons isUpdating={isUpdating}/>
                        </Form>
                    )}
                </Card>
            </Spin>
        </div>
    );
};

// Alt bileşenler
const ContactInformationForm = () => (
    <>
        <Row gutter={16}>
            <Col xs={24}>
                <h2 style={{textDecoration: "underline"}}>İletişim Bilgileri</h2>
            </Col>
            <Col xs={24} sm={12} md={8}>
                <Form.Item name="phoneNumber" label="Telefon Numarası">
                    <Input/>
                </Form.Item>
                <Form.Item name="id" hidden>
                    <Input/>
                </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
                <Form.Item name="email" label="E-posta">
                    <Input/>
                </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
                <Form.Item name="address" label="Adres">
                    <Input.TextArea rows={2}/>
                </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
                <Form.Item name="educationLevel" label="Eğitim Seviyesi">
                    <Input/>
                </Form.Item>
            </Col>
        </Row>
    </>
);

const CompanyInformationForm = ({positions}: { positions: Position[] }) => (
    <>
        <Row gutter={16}>
            <Col xs={24}>
                <h2 style={{textDecoration: "underline"}}>Şirketi İçi Bilgileri</h2>
            </Col>
            <Col xs={24} sm={12} md={8}>
                <Form.Item name="department" label="Departman">
                    <Input/>
                </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
                <Form.Item name="positionId" label="Pozisyon">
                    <Select>
                        {positions.map((position) => (
                            <Option key={position.positionId} value={position.positionId}>
                                {position.positionName}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
                <Form.Item name="salary" label="Maaş">
                    <InputNumber style={{width: "100%"}}/>
                </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
                <Form.Item name="vacationDays" label="Yıllık izin sayısı">
                    <Input/>
                </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
                <Form.Item name="shiftSchedule" label="Vardiya tipi">
                    <Input/>
                </Form.Item>
            </Col>
        </Row>
    </>
);

const EmergencyInformationForm = () => (
    <>
        <Row gutter={16}>
            <Col xs={24}>
                <h2 style={{textDecoration: "underline"}}>Acil Durum Bilgileri</h2>
            </Col>
            <Col xs={24} sm={12} md={8}>
                <Form.Item name="emergencyContact" label="Acil İletişim">
                    <Input/>
                </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
                <Form.Item name="emergencyPhone" label="Acil İletişim Telefon">
                    <Input/>
                </Form.Item>
            </Col>
        </Row>
    </>
);

const DriverLicenseForm = ({
                               driverLicenses,
                               onDriverLicenseSwitchChange,
                               form,
                           }: {
    driverLicenses: DriverLicense[];
    onDriverLicenseSwitchChange: (checked: boolean) => void;
    form: any;
}) => (
    <>
        <Row gutter={16}>
            <Col xs={24}>
                <h2 style={{textDecoration: "underline"}}>Araç Kabiliyeti</h2>
            </Col>
            <Col xs={24} sm={12} md={8}>
                <Form.Item name="hasDriverLicense" label="Ehliyet Durumu" valuePropName="checked">
                    <Switch onChange={onDriverLicenseSwitchChange}/>
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
        </Row>
    </>
);

const HealthInformationForm = () => (
    <>
        <Row gutter={16}>
            <Col xs={24}>
                <h2 style={{textDecoration: "underline"}}>Sağlık durumları</h2>
            </Col>
            <Col xs={24} sm={12} md={8}>
                <Form.Item name="hasHealthInsurance" label="Sağlık Sigortası" valuePropName="checked">
                    <Switch/>
                </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
                <Form.Item name="lastHealthCheck" label="Son Sağlık Kontrolü">
                    <DatePicker style={{width: "100%"}}/>
                </Form.Item>
            </Col>
            <Col xs={24}>
                <Form.Item name="notes" label="Notlar">
                    <Input.TextArea rows={4}/>
                </Form.Item>
            </Col>
        </Row>
    </>
);

const FormButtons = ({isUpdating}: { isUpdating: boolean }) => (
    <Row>
        <Col xs={24}>
            <Form.Item>
                <Row gutter={16}>
                    <Col xs={8}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isUpdating}
                            style={{width: '100%', backgroundColor: '#52c41a', borderColor: '#52c41a'}}
                        >
                            {isUpdating ? 'Güncelleniyor...' : 'Kaydet'}
                        </Button>
                    </Col>
                    <Col xs={8}>
                        <Button
                            type="primary"
                            htmlType="button"
                            loading={isUpdating}
                            style={{width: '100%', backgroundColor: '#faad14', borderColor: '#faad14'}}
                        >
                            {isUpdating ? 'Güncelleniyor...' : 'İşten Ayrıldı'}
                        </Button>
                    </Col>
                    <Col xs={8}>
                        <Button
                            type="primary"
                            htmlType="button"
                            loading={isUpdating}
                            style={{width: '100%', backgroundColor: '#ff4d4f', borderColor: '#ff4d4f'}}
                        >
                            {isUpdating ? 'Güncelleniyor...' : 'Personeli Sil'}
                        </Button>
                    </Col>
                </Row>
            </Form.Item>
        </Col>
    </Row>
);

export default PersonUpdateById;
