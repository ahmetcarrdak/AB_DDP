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
    Modal,
} from "antd";
import { apiUrl } from "../../Settings";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "react-router-dom";
import { DriverLicense, driverLicenses } from "../../constants"; // Sabitler ayrı bir dosyada
import apiClient from "../../Utils/ApiClient";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

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
    const { id } = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const [positions, setPositions] = useState<Position[]>([]);
    const [personDetails, setPersonDetails] = useState<PersonDetails | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isTerminationModalVisible, setIsTerminationModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    useEffect(() => {
        const fetchPositions = async () => {
            try {
                const response = await apiClient.get(`${apiUrl.positions}`);
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
    }, []);

    useEffect(() => {
        const fetchPersonDetails = async () => {
            if (!id) return;

            setIsLoadingDetails(true);
            try {
                const url = apiUrl.personById(id);
                const response = await apiClient.get(url);
                const data = response.data;

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
                setIsLoadingDetails(false);
            }
        };

        fetchPersonDetails();
    }, [id, form]);

    const onFinish = async (values: any) => {
        setIsUpdating(true);
        try {
            const formattedValues = {
                ...values,
                terminationDate: values.terminationDate ? values.terminationDate.toISOString() : null,
                lastHealthCheck: values.lastHealthCheck ? values.lastHealthCheck.toISOString() : null,
            };

            await apiClient.put(`${apiUrl.updatePerson}`, formattedValues);
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
            setIsUpdating(false);
        }
    };

    const onDriverLicenseSwitchChange = (checked: boolean) => {
        form.setFieldsValue({
            hasDriverLicense: checked,
            driverLicenseType: checked ? form.getFieldValue("driverLicenseType") : undefined,
        });
    };

    const handleTerminationSubmit = async (values: any) => {
        try {
            await apiClient.put(`${apiUrl.updateTermination}`, {
                id: personDetails?.id,
                terminationDate: values.terminationDate.toISOString(),
            });
            toast.success("İşten ayrılma tarihi güncellendi.");
        } catch (error) {
            console.error("İşten ayrılma tarihi güncellenirken hata oluştu:", error);
            toast.error("İşten ayrılma tarihi güncellenirken bir hata oluştu.");
        } finally {
            setIsTerminationModalVisible(false);
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            await apiClient.delete(`${apiUrl.deletePerson}/${personDetails?.id}`);
            toast.success("Personel başarıyla silindi.");
        } catch (error) {
            console.error("Personel silinirken hata oluştu:", error);
            toast.error("Personel silinirken bir hata oluştu.");
        } finally {
            setIsDeleteModalVisible(false);
        }
    };

    if (!id) return null;

    return (
        <div className="person-update-page">
            <ToastContainer />
            <Title level={2}>Personel Bilgileri Düzenle</Title>

            <Spin spinning={isLoadingDetails} tip="Personel bilgileri yükleniyor...">
                <Card>
                    {personDetails && (
                        <Form form={form} layout="vertical" onFinish={onFinish}>
                            <ContactInformationForm />
                            <CompanyInformationForm positions={positions} />
                            <EmergencyInformationForm />
                            <DriverLicenseForm
                                driverLicenses={driverLicenses}
                                onDriverLicenseSwitchChange={onDriverLicenseSwitchChange}
                                form={form}
                            />
                            <HealthInformationForm />
                            <FormButtons
                                isUpdating={isUpdating}
                                onTerminationClick={() => setIsTerminationModalVisible(true)}
                                onDeleteClick={() => setIsDeleteModalVisible(true)}
                            />
                        </Form>
                    )}
                </Card>
            </Spin>

            {/* Modallar */}
            <TerminationModal
                visible={isTerminationModalVisible}
                onCancel={() => setIsTerminationModalVisible(false)}
                onFinish={handleTerminationSubmit}
            />
            <DeleteModal
                visible={isDeleteModalVisible}
                onCancel={() => setIsDeleteModalVisible(false)}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
};

// Alt bileşenler
const ContactInformationForm = () => (
    <>
        <Row gutter={16}>
            <Col xs={24}>
                <h2 style={{ textDecoration: "underline" }}>İletişim Bilgileri</h2>
            </Col>
            <Col xs={24} sm={12} md={8}>
                <Form.Item name="phoneNumber" label="Telefon Numarası">
                    <Input />
                </Form.Item>
                <Form.Item name="id" hidden>
                    <Input />
                </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
                <Form.Item name="email" label="E-posta">
                    <Input />
                </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
                <Form.Item name="address" label="Adres">
                    <Input.TextArea rows={2} />
                </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
                <Form.Item name="educationLevel" label="Eğitim Seviyesi">
                    <Input />
                </Form.Item>
            </Col>
        </Row>
    </>
);

const CompanyInformationForm = ({ positions }: { positions: Position[] }) => (
    <>
        <Row gutter={16}>
            <Col xs={24}>
                <h2 style={{ textDecoration: "underline" }}>Şirketi İçi Bilgileri</h2>
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
                            <Option key={position.positionId} value={position.positionId}>
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
                <Form.Item name="vacationDays" label="Yıllık izin sayısı">
                    <Input />
                </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
                <Form.Item name="shiftSchedule" label="Vardiya tipi">
                    <Input />
                </Form.Item>
            </Col>
        </Row>
    </>
);

const EmergencyInformationForm = () => (
    <>
        <Row gutter={16}>
            <Col xs={24}>
                <h2 style={{ textDecoration: "underline" }}>Acil Durum Bilgileri</h2>
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
                <h2 style={{ textDecoration: "underline" }}>Araç Kabiliyeti</h2>
            </Col>
            <Col xs={24} sm={12} md={8}>
                <Form.Item name="hasDriverLicense" label="Ehliyet Durumu" valuePropName="checked">
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
        </Row>
    </>
);

const HealthInformationForm = () => (
    <>
        <Row gutter={16}>
            <Col xs={24}>
                <h2 style={{ textDecoration: "underline" }}>Sağlık durumları</h2>
            </Col>
            <Col xs={24} sm={12} md={8}>
                <Form.Item name="hasHealthInsurance" label="Sağlık Sigortası" valuePropName="checked">
                    <Switch />
                </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
                <Form.Item name="lastHealthCheck" label="Son Sağlık Kontrolü">
                    <DatePicker style={{ width: "100%" }} />
                </Form.Item>
            </Col>
            <Col xs={24}>
                <Form.Item name="notes" label="Notlar">
                    <Input.TextArea rows={4} />
                </Form.Item>
            </Col>
        </Row>
    </>
);

const FormButtons = ({
                         isUpdating,
                         onTerminationClick,
                         onDeleteClick,
                     }: {
    isUpdating: boolean;
    onTerminationClick: () => void;
    onDeleteClick: () => void;
}) => (
    <Row>
        <Col xs={24}>
            <Form.Item>
                <Row gutter={16}>
                    <Col xs={8}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isUpdating}
                            style={{ width: '100%', backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                        >
                            {isUpdating ? 'Güncelleniyor...' : 'Kaydet'}
                        </Button>
                    </Col>
                    <Col xs={8}>
                        <Button
                            type="primary"
                            htmlType="button"
                            loading={isUpdating}
                            style={{ width: '100%', backgroundColor: '#faad14', borderColor: '#faad14' }}
                            onClick={onTerminationClick}
                        >
                            İşten Ayrıldı
                        </Button>
                    </Col>
                    <Col xs={8}>
                        <Button
                            type="primary"
                            htmlType="button"
                            loading={isUpdating}
                            style={{ width: '100%', backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }}
                            onClick={onDeleteClick}
                        >
                            Personeli Sil
                        </Button>
                    </Col>
                </Row>
            </Form.Item>
        </Col>
    </Row>
);

const TerminationModal = ({ visible, onCancel, onFinish }: {
    visible: boolean;
    onCancel: () => void;
    onFinish: (values: any) => void;
}) => {
    const [form] = Form.useForm();

    return (
        <Modal
            title="İşten Ayrılma Tarihi Girin"
            visible={visible}
            onCancel={onCancel}
            onOk={() => form.submit()}
            okText="Kaydet"
            cancelText="İptal"
        >
            <Form form={form} onFinish={onFinish}>
                <Form.Item
                    name="terminationDate"
                    label="İşten Ayrılma Tarihi"
                    rules={[{ required: true, message: "Lütfen tarih girin!" }]}
                >
                    <DatePicker style={{ width: "100%" }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

const DeleteModal = ({ visible, onCancel, onConfirm }: {
    visible: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}) => {
    return (
        <Modal
            title="Personeli Sil"
            visible={visible}
            onCancel={onCancel}
            onOk={onConfirm}
            okText="Sil"
            cancelText="İptal"
            okButtonProps={{ danger: true }}
        >
            <p>Bu personeli silmek istediğinizden emin misiniz?</p>
        </Modal>
    );
};

export default PersonUpdateById;