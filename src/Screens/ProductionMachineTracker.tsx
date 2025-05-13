import React, { useEffect, useState } from 'react';
import {
    Layout,
    Menu,
    Table,
    Typography,
    message,
    Spin,
    Tag,
    Button,
    Modal,
    Descriptions,
    Card,
    Space,
    Badge
} from 'antd';
import {
    InfoCircleOutlined,
    PlayCircleOutlined,
    CheckCircleOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';
import apiClient from "../Utils/ApiClient";
import {apiUrl} from "../Settings";

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

interface Machine {
    id: number;
    productionInstructionId: number;
    machineId: number;
    line: number;
    status: number; // 0: bekliyor, 1: aktif, 2: tamamlandı
    entryDate: string | null;
    exitDate: string | null;
    machine: {
        id: number;
        name: string;
        model: string;
        serialNumber: string;
        isOperational: boolean;
        location: string;
    };
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
    title: string;
    barcode: string;
    insertDate: string;
    isComplated: number;
    machineId: any | number;
    productionToMachines: Machine[];
    productToSeans: ProductToSeans[];
    description?: string;
    count?: number;
}

const ProductionMachineTracker: React.FC = () => {
    const [instructions, setInstructions] = useState<ProductionInstruction[]>([]);
    const [machineList, setMachineList] = useState<Machine[]>([]);
    const [selectedMachineId, setSelectedMachineId] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedInstruction, setSelectedInstruction] = useState<ProductionInstruction | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [processing, setProcessing] = useState(false);

    const fetchInstructions = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get<ProductionInstruction[]>(apiUrl.ProductionInsList);
            setInstructions(response.data);

            const allMachines: Machine[] = response.data.flatMap((ins) =>
                ins.productionToMachines.map((m) => ({
                    ...m,
                    machine: m.machine,
                }))
            );

            const uniqueMachines = Array.from(
                new Map(allMachines.map((m) => [m.machine.id, m])).values()
            );

            setMachineList(uniqueMachines);
            if (uniqueMachines.length > 0) {
                setSelectedMachineId(uniqueMachines[0].machine.id);
            }
        } catch (error) {
            message.error('Veriler yüklenirken hata oluştu');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstructions();
    }, []);

    const getInstructionsForMachine = (machineId: number) => {
        return instructions.filter(ins =>
            ins.productionToMachines.some(m => m.machine.id === machineId)
        );
    };

    const getInstructionStatus = (instruction: ProductionInstruction, machineId: number) => {
        const machineAssignment = instruction.productionToMachines.find(m => m.machine.id === machineId);
        const seansStatus = instruction.productToSeans?.find(s => s.machineId === machineId)?.status;
        return seansStatus !== undefined ? seansStatus : machineAssignment?.status;
    };

    const handleStartProcess = async (instruction: ProductionInstruction) => {
        if (!selectedMachineId) return;

        setProcessing(true);
        try {
            const response = await apiClient.post(`${apiUrl.MachineOperations}/enter`, {
                machineId: selectedMachineId,
                barcode: instruction.barcode,
                count: instruction.count || 1
            });

            message.success(response.data?.message || "İşlem başlatıldı");
            fetchInstructions(); // Verileri yenile
        } catch (error: any) {
            message.error(error.response?.data?.message || "İşlem başlatılamadı");
        } finally {
            setProcessing(false);
        }
    };

    const handleCompleteProcess = async (instruction: ProductionInstruction) => {
        if (!selectedMachineId) return;

        setProcessing(true);
        try {
            const response = await apiClient.post(`${apiUrl.MachineOperations}/exit`, {
                machineId: selectedMachineId,
                barcode: instruction.barcode,
                count: instruction.count || 1
            });

            message.success(response.data?.message || "İşlem tamamlandı");
            fetchInstructions(); // Verileri yenile
        } catch (error: any) {
            message.error(error.response?.data?.message || "İşlem tamamlanamadı");
        } finally {
            setProcessing(false);
        }
    };

    const countActiveInstructions = (machineId: number) => {
        return instructions.filter(ins =>
            ins.productionToMachines.some(m =>
                m.machine.id === machineId &&
                (getInstructionStatus(ins, machineId) === 1)
            )
        ).length;
    };

    const columns = [
        {
            title: 'Talimat Bilgileri',
            key: 'info',
            render: (record: ProductionInstruction) => (
                <div>
                    <Text strong>{record.title}</Text>
                    <br />
                    <Text type="secondary">Barkod: {record.barcode}</Text>
                    <br />
                    <Text type="secondary">Adet: {record.count || 1}</Text>
                </div>
            ),
        },
        {
            title: 'Tarih',
            dataIndex: 'insertDate',
            key: 'insertDate',
            render: (date: string) => new Date(date).toLocaleString(),
        },
        {
            title: 'Durum',
            key: 'status',
            render: (record: ProductionInstruction) => {
                if (!selectedMachineId) return null;

                const status = getInstructionStatus(record, selectedMachineId);
                const machineAssignment = record.productionToMachines.find(m => m.machine.id === selectedMachineId);

                let statusText = '';
                let color = '';

                switch(status) {
                    case 0:
                        statusText = 'Bekliyor';
                        color = 'default';
                        break;
                    case 1:
                        statusText = 'Aktif';
                        color = 'processing';
                        break;
                    case 2:
                        statusText = 'Tamamlandı';
                        color = 'success';
                        break;
                    default:
                        statusText = 'Bilinmiyor';
                        color = 'warning';
                }

                return (
                    <Space direction="vertical">
                        <Tag color={color}>{statusText}</Tag>
                        {machineAssignment?.entryDate && (
                            <Text type="secondary">Giriş: {new Date(machineAssignment.entryDate).toLocaleTimeString()}</Text>
                        )}
                        {machineAssignment?.exitDate && (
                            <Text type="secondary">Çıkış: {new Date(machineAssignment.exitDate).toLocaleTimeString()}</Text>
                        )}
                    </Space>
                );
            },
        },
        {
            title: 'İşlemler',
            key: 'actions',
            render: (record: ProductionInstruction) => {
                if (!selectedMachineId) return null;

                const status = getInstructionStatus(record, selectedMachineId);

                return (
                    <Space>
                        <Button
                            type="primary"
                            icon={<PlayCircleOutlined />}
                            onClick={() => handleStartProcess(record)}
                            disabled={status !== 0}
                            loading={processing}
                        >
                            Başlat
                        </Button>
                        <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            danger
                            onClick={() => handleCompleteProcess(record)}
                            disabled={status !== 1}
                            loading={processing}
                        >
                            Tamamla
                        </Button>
                        <Button
                            icon={<InfoCircleOutlined />}
                            onClick={() => {
                                setSelectedInstruction(record);
                                setDetailModalVisible(true);
                            }}
                        >
                            Detaylar
                        </Button>
                    </Space>
                );
            },
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider width={280} className="site-layout-background">
                <Menu
                    mode="inline"
                    selectedKeys={[String(selectedMachineId)]}
                    onClick={(e) => setSelectedMachineId(Number(e.key))}
                    style={{ height: '100%', borderRight: 0 }}
                >
                    {machineList.map((m) => {
                        const activeCount = countActiveInstructions(m.machine.id);
                        return (
                            <Menu.Item key={m.machine.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>
                                        {m.machine.name}
                                    </span>
                                    {activeCount > 0 && (
                                        <Badge
                                            count={activeCount}
                                            style={{ backgroundColor: '#52c41a' }}
                                        />
                                    )}
                                </div>
                            </Menu.Item>
                        );
                    })}
                </Menu>
            </Sider>
            <Layout style={{ padding: '24px' }}>
                <Content
                    style={{
                        background: '#fff',
                        padding: 24,
                        margin: 0,
                        minHeight: 'calc(100vh - 48px)',
                    }}
                >
                    {loading ? (
                        <Spin size="large" />
                    ) : (
                        <>
                            <Title level={4} style={{ marginBottom: 24 }}>
                                {machineList.find((m) => m.machine.id === selectedMachineId)?.machine.name} - Üretim Talimatları
                            </Title>
                            <Table
                                dataSource={selectedMachineId ? getInstructionsForMachine(selectedMachineId) : []}
                                columns={columns}
                                rowKey="id"
                                pagination={{ pageSize: 10 }}
                                scroll={{ x: true }}
                            />
                        </>
                    )}
                </Content>
            </Layout>

            {/* Detay Modalı */}
            <Modal
                title={`Üretim Talimatı Detayları`}
                visible={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedInstruction && (
                    <div>
                        <Card title="Genel Bilgiler" style={{ marginBottom: 16 }}>
                            <Descriptions bordered column={2}>
                                <Descriptions.Item label="Başlık">{selectedInstruction.title}</Descriptions.Item>
                                <Descriptions.Item label="Barkod">{selectedInstruction.barcode}</Descriptions.Item>
                                <Descriptions.Item label="Açıklama" span={2}>
                                    {selectedInstruction.description || 'Yok'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Adet">{selectedInstruction.count || 1}</Descriptions.Item>
                                <Descriptions.Item label="Oluşturulma Tarihi">
                                    {new Date(selectedInstruction.insertDate).toLocaleString()}
                                </Descriptions.Item>
                                <Descriptions.Item label="Genel Durum">
                                    <Tag color={selectedInstruction.isComplated ? 'green' : 'orange'}>
                                        {selectedInstruction.isComplated ? 'Tamamlandı' : 'Devam Ediyor'}
                                    </Tag>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        <Card title="Makine İş Akışı">
                            {selectedInstruction.productionToMachines
                                .sort((a, b) => a.line - b.line)
                                .map((machine, index) => {
                                    const status = getInstructionStatus(selectedInstruction, machine.machine.id);
                                    let statusText = '';
                                    let statusColor = '';

                                    switch(status) {
                                        case 0:
                                            statusText = 'Bekliyor';
                                            statusColor = 'default';
                                            break;
                                        case 1:
                                            statusText = 'Aktif';
                                            statusColor = 'processing';
                                            break;
                                        case 2:
                                            statusText = 'Tamamlandı';
                                            statusColor = 'success';
                                            break;
                                        default:
                                            statusText = 'Bilinmiyor';
                                            statusColor = 'warning';
                                    }

                                    return (
                                        <div key={machine.id} style={{ marginBottom: 16 }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginBottom: 8
                                            }}>
                                                <Tag color={statusColor}>{statusText}</Tag>
                                                <Text strong style={{ margin: '0 8px' }}>
                                                    {machine.machine.name} (Hat {machine.line})
                                                </Text>
                                                {index < selectedInstruction.productionToMachines.length - 1 && (
                                                    <ArrowRightOutlined style={{ margin: '0 8px' }} />
                                                )}
                                            </div>
                                            <Descriptions bordered size="small" column={2}>
                                                <Descriptions.Item label="Giriş Tarihi">
                                                    {machine.entryDate ?
                                                        new Date(machine.entryDate).toLocaleString() : 'Bekliyor'}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Çıkış Tarihi">
                                                    {machine.exitDate ?
                                                        new Date(machine.exitDate).toLocaleString() : 'Devam Ediyor'}
                                                </Descriptions.Item>
                                            </Descriptions>
                                        </div>
                                    );
                                })
                            }
                        </Card>
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default ProductionMachineTracker;