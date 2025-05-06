import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import apiClient from "../Utils/ApiClient";
import {apiUrl} from "../Settings";
import {
    message,
    Card,
    Descriptions,
    Spin,
    Typography,
    Button,
    Modal,
    Tabs,
    Tag,
    Tooltip,
    Space,
    Input,
    Checkbox,
    Row,
    Col, Alert
} from "antd";
import {InfoCircleOutlined} from '@ant-design/icons';

const {Title} = Typography;
const {TabPane} = Tabs;

interface Company {
    id: number;
}

interface Machine {
    id: number;
    companyId: number;
    name: string;
    model: string;
    serialNumber: string;
    manufacturer: string;
    purchaseDate: string;
    purchasePrice: number;
    lastMaintenanceDate: string;
    nextMaintenanceDate: string;
    description: string;
    isActive: boolean;
    location: string;
    warrantyPeriod: number;
    powerConsumption: string;
    dimensions: string;
    weight: string;
    company: Company | null;
    totalFault: number;
    isOperational: boolean;
    createdAt: string;
    updatedAt: string;
}

interface ProductionToMachine {
    id: number;
    productionInstructionId: number;
    machineId: number;
    line: number;
    status: number;
    entryDate: string;
    exitDate: string;
    machine: Machine;
}

interface ProductToSeans {
    id: number;
    productId: number;
    count: number;
    barcode: string;
    machineId: number;
    batchSize: number;
    isCompleted: boolean;
    status: number;
}

interface ProductionInstruction {
    id: number;
    companyId: number;
    title: string;
    description: string;
    barcode: string;
    insertDate: string;
    complatedDate: string;
    deletedDate: string;
    isComplated: number;
    isDeleted: number;
    machineId: number;
    count: number;
    productionToMachines: ProductionToMachine[];
    productionStores: any[];
    productToSeans: ProductToSeans[];
}

function QRScreen() {
    const {id} = useParams<{ id: string }>();
    const [machine, setMachine] = useState<Machine | null>(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [barcode, setBarcode] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [allowEditQuantity, setAllowEditQuantity] = useState(false);
    const [productionDetails, setProductionDetails] = useState<ProductionInstruction | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [productionInstructions, setProductionInstructions] = useState<ProductionInstruction[]>([]);
    const [responseMessage, setResponseMessage] =  useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                setLoading(true);
                const [machineResponse, instructionsResponse] = await Promise.all([
                    apiClient.get<Machine>(apiUrl.machineById(id!)),
                    apiClient.get<ProductionInstruction[]>(apiUrl.ProductionInsList)
                ]);

                if (isMounted) {
                    setMachine(machineResponse.data);
                    setProductionInstructions(instructionsResponse.data);
                }
            } catch (error) {
                message.error("Veri yüklenirken bir hata oluştu");
                console.error("Error fetching data:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [id]);

    const handleShowDetails = () => {
        try {
            setLoading(true);

            // Barkoda göre filtreleme
            const matchedInstruction = productionInstructions.find(item => {
                return item.barcode === barcode || item.productToSeans?.some(seans => seans.barcode === barcode);
            });

            if (matchedInstruction) {
                setProductionDetails(matchedInstruction);

                // Adeti otomatik doldur
                const matchedSeans = matchedInstruction.productToSeans?.find(s => s.barcode === barcode);
                setQuantity(matchedSeans ? matchedSeans.count : matchedInstruction.count);

                setShowDetails(true);
            } else {
                message.warning("Bu barkoda ait üretim talimatı bulunamadı");
            }
        } catch (error) {
            message.error("Detaylar getirilirken bir hata oluştu");
            console.error("Error fetching production details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteProcess = async () => {
        try {
            setLoading(true);

            // Query string parametreleri oluştur
            const params = new URLSearchParams();
            params.append('machineId', id!);
            params.append('barcode', barcode);
            params.append('count', quantity.toString());

            const response = await apiClient.post(
                `${apiUrl.ProductionInsProcess}?${params.toString()}`,
                null, // Body kısmı boş
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                setResponseMessage(response.data?.message || "İşlem başarıyla tamamlandı");
                //resetForm();
            }
        } catch (error: any) {

            setResponseMessage(
                error.response?.data?.message ||
                "İşlem tamamlanırken bir hata oluştu"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleMachineEntry = async () => {
        try {
            setLoading(true);
            const response = await apiClient.post(`${apiUrl.MachineOperations}/enter`, {
                machineId: parseInt(id!),
                barcode,
                count: quantity
            });

            setResponseMessage(response.data?.message || "Makineye giriş başarılı");
            resetForm();
        } catch (error: any) {
            setResponseMessage(error.response?.data?.message || "Giriş işlemi başarısız");
        } finally {
            setLoading(false);
        }
    };

    const handleMachineExit = async () => {
        try {
            setLoading(true);
            const response = await apiClient.post(`${apiUrl.MachineOperations}/exit`, {
                machineId: parseInt(id!),
                barcode,
                count: quantity
            });

            setResponseMessage(response.data?.message || "Makinadan çıkış başarılı");
            resetForm();
        } catch (error: any) {
            setResponseMessage(error.response?.data?.message || "Çıkış işlemi başarısız");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setBarcode('');
        setQuantity(0);
        setShowDetails(false);
        setProductionDetails(null);
        setAllowEditQuantity(false);
    };


    if (loading && !machine) {
        return (
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                <Spin size="large"/>
            </div>
        );
    }

    if (!machine) {
        return <div>Makine bulunamadı</div>;
    }

    return (
        <div style={{padding: '24px'}}>
            {/* Başlık ve Info Butonu */}
            <Space align="center" style={{marginBottom: 24}}>
                <Title level={2} style={{margin: 0}}>
                    {machine.name}
                </Title>
                <Tooltip title="Detayları görüntülemek için tıklayın">
                    <Button
                        type="text"
                        icon={<InfoCircleOutlined/>}
                        onClick={() => setModalVisible(true)}
                        style={{color: '#1890ff'}}
                    />
                </Tooltip>
            </Space>

            {/* Makine Bilgileri Kartı */}
            <Card>
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="Model" span={2}>
                        <Tag color="blue">{machine.model}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Seri Numarası">{machine.serialNumber}</Descriptions.Item>
                    <Descriptions.Item label="Üretici">{machine.manufacturer}</Descriptions.Item>
                    <Descriptions.Item label="Durum">
                        <Tag color={machine.isOperational ? "green" : "red"}>
                            {machine.isOperational ? "Çalışıyor" : "Arızalı"}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Toplam Arıza">{machine.totalFault}</Descriptions.Item>
                </Descriptions>
            </Card>

            {/* Üretim İşlem Kartı */}
            <Card title="Üretim İşlemi" style={{marginTop: 16}}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Input
                            placeholder="Barkod giriniz"
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                            onPressEnter={handleShowDetails}
                        />
                    </Col>
                    <Col span={12}>
                        <Space>
                            <Input
                                placeholder="Adet"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                disabled={!allowEditQuantity}
                            />
                            <Checkbox
                                checked={allowEditQuantity}
                                onChange={(e) => setAllowEditQuantity(e.target.checked)}
                            >
                                Adet değiştir
                            </Checkbox>
                        </Space>
                    </Col>
                </Row>
                <Row gutter={16} style={{marginTop: 16}}>
                    <Col span={12}>
                        <Button
                            type="primary"
                            onClick={handleShowDetails}
                            disabled={!barcode}
                            loading={loading}
                            block
                        >
                            Detayları Göster
                        </Button>
                    </Col>
                    <Row gutter={16} style={{marginTop: 16}}>
                        <Col span={12}>
                            <Button
                                type="primary"
                                onClick={handleMachineEntry}
                                disabled={!barcode || quantity <= 0}
                                loading={loading}
                                block
                            >
                                Makineye Giriş Yap
                            </Button>
                        </Col>
                        <Col span={12}>
                            <Button
                                type="primary"
                                danger
                                onClick={handleMachineExit}
                                disabled={!barcode || quantity <= 0}
                                loading={loading}
                                block
                            >
                                Makineden Çıkış Yap
                            </Button>
                        </Col>
                    </Row>
                </Row>
            </Card>
            {responseMessage && (
                <Alert
                    message={responseMessage}
                    type={responseMessage.includes('başarı') ? 'success' : 'error'}
                    showIcon
                    closable
                    onClose={() => setResponseMessage(null)}
                    style={{ marginBottom: 16, marginTop: 10 }}
                />
            )}
            {/* Üretim Detayları Kartı */}
            {showDetails && productionDetails && (
                <Card title="Üretim Detayları" style={{marginTop: 16}}>
                    <Tabs defaultActiveKey="1">
                        <TabPane tab="Genel Bilgiler" key="1">
                            <Descriptions bordered column={2}>
                                <Descriptions.Item label="Üretim Talimatı">{productionDetails.title}</Descriptions.Item>
                                <Descriptions.Item label="Barkod">{productionDetails.barcode}</Descriptions.Item>
                                <Descriptions.Item label="Açıklama">{productionDetails.description}</Descriptions.Item>
                                <Descriptions.Item label="Toplam Adet">{productionDetails.count}</Descriptions.Item>
                                <Descriptions.Item label="Oluşturulma Tarihi">
                                    {new Date(productionDetails.insertDate).toLocaleDateString()}
                                </Descriptions.Item>
                                <Descriptions.Item label="Durum">
                                    <Tag color={productionDetails.isComplated ? "green" : "orange"}>
                                        {productionDetails.isComplated ? "Tamamlandı" : "Devam Ediyor"}
                                    </Tag>
                                </Descriptions.Item>
                            </Descriptions>
                        </TabPane>

                        <TabPane tab="Seans Bilgileri" key="2">
                            {productionDetails.productToSeans?.map((seans, index) => (
                                <Card key={index} style={{marginBottom: 16}}>
                                    <Descriptions bordered column={2}>
                                        <Descriptions.Item label="Seans Barkodu">{seans.barcode}</Descriptions.Item>
                                        <Descriptions.Item label="Adet">{seans.count}</Descriptions.Item>
                                        <Descriptions.Item label="Durum">
                                            <Tag color={seans.isCompleted ? "green" : "orange"}>
                                                {seans.isCompleted ? "Tamamlandı" : "Devam Ediyor"}
                                            </Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Makine ID">{seans.machineId}</Descriptions.Item>
                                        <Descriptions.Item label="Toplu İş Boyutu">{seans.batchSize}</Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            ))}
                        </TabPane>

                        <TabPane tab="Makine Bilgileri" key="3">
                            {productionDetails.productionToMachines?.map((prodMachine, index) => (
                                <Card key={index} style={{marginBottom: 16}}>
                                    <Descriptions bordered column={2}>
                                        <Descriptions.Item
                                            label="Makine Adı">{prodMachine.machine.name}</Descriptions.Item>
                                        <Descriptions.Item label="Model">{prodMachine.machine.model}</Descriptions.Item>
                                        <Descriptions.Item
                                            label="Seri No">{prodMachine.machine.serialNumber}</Descriptions.Item>
                                        <Descriptions.Item label="Hattı">{prodMachine.line}</Descriptions.Item>
                                        <Descriptions.Item label="Giriş Tarihi">
                                            {new Date(prodMachine.entryDate).toLocaleString()}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Çıkış Tarihi">
                                            {prodMachine.exitDate ? new Date(prodMachine.exitDate).toLocaleString() : 'Devam Ediyor'}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            ))}
                        </TabPane>
                    </Tabs>
                </Card>
            )}

            {/* Makine Detay Modalı */}
            <Modal
                title={`${machine.name} Detayları`}
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={800}
            >
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Genel Bilgiler" key="1">
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Model">{machine.model}</Descriptions.Item>
                            <Descriptions.Item label="Seri No">{machine.serialNumber}</Descriptions.Item>
                            <Descriptions.Item label="Üretici">{machine.manufacturer}</Descriptions.Item>
                            <Descriptions.Item label="Lokasyon">{machine.location}</Descriptions.Item>
                            <Descriptions.Item label="Açıklama">{machine.description}</Descriptions.Item>
                            <Descriptions.Item label="Garanti Süresi">{machine.warrantyPeriod} ay</Descriptions.Item>
                        </Descriptions>
                    </TabPane>

                    <TabPane tab="Teknik Özellikler" key="2">
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Güç Tüketimi">{machine.powerConsumption}</Descriptions.Item>
                            <Descriptions.Item label="Boyutlar">{machine.dimensions}</Descriptions.Item>
                            <Descriptions.Item label="Ağırlık">{machine.weight}</Descriptions.Item>
                            <Descriptions.Item label="Durum">
                                <Tag color={machine.isOperational ? "green" : "red"}>
                                    {machine.isOperational ? "Aktif" : "Pasif"}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </TabPane>

                    <TabPane tab="Bakım Bilgileri" key="3">
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Satın Alma Tarihi">
                                {new Date(machine.purchaseDate).toLocaleDateString()}
                            </Descriptions.Item>
                            <Descriptions.Item label="Son Bakım">
                                {new Date(machine.lastMaintenanceDate).toLocaleDateString()}
                            </Descriptions.Item>
                            <Descriptions.Item label="Sonraki Bakım">
                                {new Date(machine.nextMaintenanceDate).toLocaleDateString()}
                            </Descriptions.Item>
                            <Descriptions.Item label="Toplam Arıza">{machine.totalFault}</Descriptions.Item>
                            <Descriptions.Item label="Satın Alma Fiyatı">
                                {machine.purchasePrice.toLocaleString()} TL
                            </Descriptions.Item>
                        </Descriptions>
                    </TabPane>
                </Tabs>
            </Modal>
        </div>
    );
}

export default QRScreen;