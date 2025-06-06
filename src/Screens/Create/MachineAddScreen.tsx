import React, {memo, useState} from "react";
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
    Space,
    Tooltip,
    InputNumber
} from "antd";
import {ReloadOutlined, CloseOutlined, CheckOutlined} from "@ant-design/icons";
import {apiUrl} from "../../Settings";
import {toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "../../Utils/ApiClient";
import HeaderComponent from "../../Components/HeaderComponent";

const {Title, Text} = Typography;
const {TextArea} = Input;

const MachineAddScreen: React.FC<any> = memo(({onToggleMenu}) => {
    const [form] = Form.useForm();
    const [barcode, setBarcode] = useState("");
    const [isBarcodeAutoGenerated, setIsBarcodeAutoGenerated] = useState(false);
    const [loading, setLoading] = useState(false);

    const generateBarcode = () => {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const newBarcode = `MC-${new Date().getFullYear()}-${randomNum}`;
        setBarcode(newBarcode);
        setIsBarcodeAutoGenerated(true);
        form.setFieldsValue({barcode: newBarcode});
    };

    const refreshBarcode = () => {
        if (isBarcodeAutoGenerated) {
            generateBarcode();
        }
    };

    const cancelBarcode = () => {
        setBarcode("");
        setIsBarcodeAutoGenerated(false);
        form.setFieldsValue({barcode: ""});
    };

    const onFinish = async (values: any) => {
        try {
            setLoading(true)
            const machineData = {
                ...values,
                serialNumber: values.serialNumber || values.barcode, // Barkodu seri numarası olarak kullan
                purchaseDate: values.purchaseDate?.toISOString(),
                lastMaintenanceDate: values.lastMaintenanceDate?.toISOString(),
                nextMaintenanceDate: values.nextMaintenanceDate?.toISOString(),
                isActive: true,
                totalFault: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const response = await apiClient.post(apiUrl.machine, machineData);

            toast.success("Makine başarıyla oluşturuldu", {
                position: "bottom-right",
                autoClose: 3000,
                theme: "colored",
            });

            form.resetFields();
            setBarcode("");
            setIsBarcodeAutoGenerated(false);
            setLoading(false)

        } catch (error: any) {
            console.error("API Error:", error.response?.data);

            if (error.response?.data?.errors) {
                Object.entries(error.response.data.errors).forEach(([field, messages]) => {
                    toast.error(`${field}: ${(messages as string[]).join(', ')}`, {
                        position: "bottom-right",
                        autoClose: 5000,
                        theme: "colored",
                    });
                });
            } else {
                toast.error(error.message || "Makine oluşturulurken bir hata oluştu", {
                    position: "bottom-right",
                    autoClose: 5000,
                    theme: "colored",
                });
            }
        }
    };

    return (
        <>
            <HeaderComponent onToggleMenu={onToggleMenu}/>
            <div style={{padding: "20px"}}>
                <ToastContainer/>
                <Title level={2}>Yeni Makine Ekle</Title>
                <Card>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        initialValues={{
                            isOperational: true,
                            isActive: true
                        }}
                    >
                        {/* Barkod Alanı */}
                        <SectionTitle title="Barkod Bilgisi"/>
                        <Row gutter={16}>
                            <Col xs={24} md={16}>
                                <Form.Item
                                    name="barcode"
                                    label="Makine Barkodu"
                                    rules={[{required: true, message: "Barkod zorunludur"}]}
                                >
                                    <Input
                                        value={barcode}
                                        onChange={(e) => !isBarcodeAutoGenerated && setBarcode(e.target.value)}
                                        disabled={isBarcodeAutoGenerated}
                                        suffix={
                                            isBarcodeAutoGenerated && (
                                                <Tooltip title="Barkod otomatik oluşturuldu">
                                                    <CheckOutlined style={{color: '#52c41a'}}/>
                                                </Tooltip>
                                            )
                                        }
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <div style={{display: 'flex', gap: 8, marginTop: 30}}>
                                    {!isBarcodeAutoGenerated ? (
                                        <Button onClick={generateBarcode}>Otomatik Oluştur</Button>
                                    ) : (
                                        <>
                                            <Tooltip title="Yenile">
                                                <Button icon={<ReloadOutlined/>} onClick={refreshBarcode}/>
                                            </Tooltip>
                                            <Tooltip title="İptal">
                                                <Button danger icon={<CloseOutlined/>} onClick={cancelBarcode}/>
                                            </Tooltip>
                                        </>
                                    )}
                                </div>
                            </Col>
                        </Row>

                        {/* Temel Bilgiler */}
                        <SectionTitle title="Temel Bilgiler"/>
                        <Row gutter={16}>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item
                                    name="name"
                                    label="Makine Adı"
                                    rules={[{required: true, message: "Makine adı zorunludur"}]}
                                >
                                    <Input maxLength={100}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item
                                    name="model"
                                    label="Model"
                                    rules={[{required: true, message: "Model zorunludur"}]}
                                >
                                    <Input maxLength={100}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item
                                    name="serialNumber"
                                    label="Seri Numarası"
                                    rules={[{required: true, message: "Seri numarası zorunludur"}]}
                                >
                                    <Input maxLength={100}/>
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Üretici Bilgileri */}
                        <SectionTitle title="Üretici Bilgileri"/>
                        <Row gutter={16}>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item
                                    name="manufacturer"
                                    label="Üretici"
                                    rules={[{required: true, message: "Üretici zorunludur"}]}
                                >
                                    <Input maxLength={100}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item
                                    name="purchaseDate"
                                    label="Satın Alma Tarihi"
                                    rules={[{required: true, message: "Satın alma tarihi zorunludur"}]}
                                >
                                    <DatePicker style={{width: "100%"}} format="YYYY-MM-DD"/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item
                                    name="purchasePrice"
                                    label="Satın Alma Fiyatı"
                                >
                                    <InputNumber
                                        style={{width: "100%"}}
                                        min={0}
                                        formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Konum Bilgileri */}
                        <SectionTitle title="Konum Bilgileri"/>
                        <Row gutter={16}>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="location"
                                    label="Konum"
                                    rules={[{required: true, message: "Konum zorunludur"}]}
                                >
                                    <Input maxLength={100}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="dimensions"
                                    label="Boyutlar (en x boy x yükseklik)"
                                >
                                    <Input maxLength={100}/>
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Teknik Özellikler */}
                        <SectionTitle title="Teknik Özellikler"/>
                        <Row gutter={16}>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="weight"
                                    label="Ağırlık (kg)"
                                >
                                    <Input maxLength={100}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="powerConsumption"
                                    label="Güç Tüketimi"
                                >
                                    <Input maxLength={100}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24}>
                                <Form.Item
                                    name="description"
                                    label="Açıklama"
                                >
                                    <TextArea rows={4} maxLength={500}/>
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Bakım Bilgileri */}
                        <SectionTitle title="Bakım Bilgileri"/>
                        <Row gutter={16}>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="lastMaintenanceDate"
                                    label="Son Bakım Tarihi"
                                >
                                    <DatePicker style={{width: "100%"}} format="YYYY-MM-DD"/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="nextMaintenanceDate"
                                    label="Sonraki Bakım Tarihi"
                                >
                                    <DatePicker style={{width: "100%"}} format="YYYY-MM-DD"/>
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Durum Bilgileri */}
                        <SectionTitle title="Durum Bilgileri"/>
                        <Row gutter={16}>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="isOperational"
                                    label="Çalışır Durumda"
                                    valuePropName="checked"
                                >
                                    <Switch
                                        checkedChildren="Evet"
                                        unCheckedChildren="Hayır"
                                        defaultChecked
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="warrantyPeriod"
                                    label="Garanti Süresi (ay)"
                                >
                                    <InputNumber min={0} style={{width: "100%"}}/>
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Kaydet Butonu */}
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                loading={loading}
                                disabled={loading}
                            >
                                {loading ? "Makine Kaydediliyor..." : "Makineyi Kaydet"}
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </>
    );
});

const SectionTitle = ({title}: { title: string }) => (
    <Col xs={24}>
        <Text strong style={{fontSize: "16px", display: "block", margin: "16px 0 8px"}}>
            {title}
        </Text>
    </Col>
);

export default MachineAddScreen;