import React, {memo, useEffect, useState} from "react";
import {
    Form,
    Input,
    DatePicker,
    Button,
    Card,
    Row,
    Col,
    Typography,
    Select,
    Switch,
} from "antd";
import {toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {apiUrl} from "../../Settings";
import apiClient from "../../Utils/ApiClient";
import HeaderComponent from "../../Components/HeaderComponent";

const {Title, Text} = Typography;
const {TextArea} = Input;
const {Option} = Select;

const faultSeverities = ["Düşük", "Orta", "Yüksek", "Kritik"];

interface MachineScreenProps {
    onToggleMenu: () => void;
}

const MachineFaultAddScreen: React.FC<MachineScreenProps> = memo(({onToggleMenu}) => {
    const [form] = Form.useForm();
    const [machines, setMachines] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Makine listesini çek
        const fetchMachines = async () => {
            try {
                const response = await apiClient.get(`${apiUrl.machine}`); // apiClient ile GET isteği
                setMachines(response.data);
            } catch (error) {
                console.error("Makine verileri alınamadı:", error);
            }
        };

        fetchMachines();
    }, []);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const faultData = {
                machineId: values.machineId,
                faultStartDate: values.faultStartDate.toISOString(),
                faultEndDate: values.faultEndDate?.toISOString() || null,
                faultDescription: values.faultDescription,
                cause: values.cause,
                solution: values.solution,
                faultSeverity: values.faultSeverity,
                reportedBy: values.reportedBy,
                resolvedBy: values.resolvedBy,
                isResolved: values.isResolved || false
            };

            console.log(faultData);
            // apiClient ile POST isteği
            await apiClient.post(`${apiUrl.machineFault}`, faultData);

            toast.success("Arıza başarıyla eklendi", {
                position: "bottom-right",
                autoClose: 3000,
                theme: "colored",
            });

            form.resetFields(); // Formu sıfırlıyoruz
        } catch (error: any) {
            console.error("API Error Response:", error.response?.data || error.message);

            if (error.response?.data?.errors) {
                const validationErrors = error.response.data.errors;
                Object.entries(validationErrors).forEach(([field, messages]) => {
                    toast.error(`${field}: ${(messages as string[]).join(", ")}`, {
                        position: "bottom-right",
                        autoClose: 5000,
                        theme: "colored",
                    });
                });
            } else {
                toast.error("Arıza eklenirken bir hata oluştu", {
                    position: "bottom-right",
                    autoClose: 3000,
                    theme: "colored",
                });
            }
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div style={{padding: "20px"}}>
            <ToastContainer/>
            <HeaderComponent onToggleMenu={onToggleMenu}/>
            <Title level={2}>Yeni Makine Arızası Ekle</Title>
            <Card>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    {/* Makine Seçimi */}
                    <SectionTitle title="Makine Bilgileri"/>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="machineId"
                                label="Makine Seç"
                                rules={[{required: true, message: "Lütfen bir makine seçiniz"}]}
                            >
                                <Select placeholder="Makine Seç">
                                    {machines.map((machine) => (
                                        <Option key={machine.id} value={machine.id}>
                                            {machine.name} - {machine.barcode}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Arıza Bilgileri */}
                    <SectionTitle title="Arıza Bilgileri"/>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="faultStartDate"
                                label="Arıza Başlangıç Tarihi"
                                rules={[{required: true, message: "Başlangıç tarihini seçiniz"}]}
                            >
                                <DatePicker
                                    style={{width: "100%"}}
                                    format="YYYY-MM-DD HH:mm"
                                    showTime
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item name="faultEndDate" label="Arıza Bitiş Tarihi">
                                <DatePicker
                                    style={{width: "100%"}}
                                    format="YYYY-MM-DD HH:mm"
                                    showTime
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="faultSeverity"
                                label="Arıza Ciddiyeti"
                                rules={[{required: true, message: "Ciddiyet seviyesini seçiniz"}]}
                            >
                                <Select placeholder="Ciddiyet Seviyesi Seç">
                                    {faultSeverities.map((level) => (
                                        <Option key={level} value={level}>
                                            {level}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="isResolved"
                                label="Çözüldü mü?"
                                valuePropName="checked"
                            >
                                <Switch checkedChildren="Evet" unCheckedChildren="Hayır"/>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="faultDescription"
                        label="Arıza Açıklaması"
                        rules={[{required: true, message: "Arıza açıklaması giriniz"}]}
                    >
                        <TextArea rows={4} maxLength={500} placeholder="Arıza ile ilgili detaylar..."/>
                    </Form.Item>

                    <Form.Item name="cause" label="Arıza Nedeni">
                        <TextArea rows={3} maxLength={300} placeholder="Arızanın nedeni..."/>
                    </Form.Item>

                    <Form.Item name="solution" label="Çözüm">
                        <TextArea rows={3} maxLength={300} placeholder="Uygulanan çözüm..."/>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item name="reportedBy" label="Bildirimi Yapan">
                                <Input maxLength={100} placeholder="Bildirimi yapan kişi"/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="resolvedBy" label="Çözümü Yapan">
                                <Input maxLength={100} placeholder="Çözümü yapan kişi"/>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Kaydet Butonu */}
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Kaydet
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
});

// Alt Bileşen: Bölüm Başlığı
const SectionTitle = ({title}: { title: string }) => (
    <Col xs={24}>
        <Text strong style={{fontSize: "16px", display: "block", marginBottom: "16px"}}>
            {title}
        </Text>
    </Col>
);

export default MachineFaultAddScreen;
