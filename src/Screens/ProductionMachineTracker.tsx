import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {
    Layout,
    Card,
    Row,
    Col,
    Typography,
    Tag,
    Space,
    Drawer,
    Table,
    Spin,
    Empty,
    Divider,
    Badge,
    Tabs,
    Button,
    Alert
} from 'antd';
import {
    ToolOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    InfoCircleOutlined,
    ReloadOutlined,
    WarningOutlined
} from '@ant-design/icons';
import apiClient from "../Utils/ApiClient";
import {apiUrl} from "../Settings";
import HeaderComponent from "../Components/HeaderComponent";

const {Header, Content} = Layout;
const {Title, Text} = Typography;
const {TabPane} = Tabs;

// Tip tanımlamaları
interface Company {
    name: string;
}

interface Machine {
    id: number;
    name: string;
    model: string;
    serialNumber: string;
    manufacturer: string;
    purchaseDate: string;
    lastMaintenanceDate: string;
    nextMaintenanceDate: string;
    description: string;
    isActive: boolean;
    location: string;
    isOperational: boolean;
    company: Company | null;
    totalFault: number;
}

interface ProductionToMachine {
    id: number;
    productionInstructionId: number;
    machineId: number;
    line: number;
    entryDate: string;
    exitDate: string;
    machine: Machine;
}

interface ProductionStore {
    id: number;
    productionInstructionId: number;
    name: string;
    barkod: string;
}

interface ProductionInstruction {
    id: number;
    title: string;
    description: string;
    insertDate: string;
    complatedDate: string | null;
    deletedDate: string | null;
    isComplated: number;
    isDeleted: number;
    machineId: number | null;
    productionToMachines: ProductionToMachine[];
    productionStores: ProductionStore[];
}

interface ProdutionInstructionProps {
    onToggleMenu: () => void;
}

const ProductionMachineTracker: React.FC<ProdutionInstructionProps> = ({onToggleMenu}) => {
    // State tanımlamaları
    const [machines, setMachines] = useState<Machine[]>([]);
    const [productions, setProductions] = useState<ProductionInstruction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<ProductionInstruction | Machine | null>(null);
    const [selectedItemType, setSelectedItemType] = useState<'machine' | 'production'>('machine');

    // Verilerin getirilmesi
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Makineleri ve üretim talimatlarını paralel olarak çek
                const [machinesResponse, productionsResponse] = await Promise.all([
                    apiClient.get(apiUrl.machine),
                    apiClient.get(apiUrl.ProductionInsList)
                ]);

                setMachines(machinesResponse.data);
                setProductions(productionsResponse.data);
                setError(null);
            } catch (err) {
                console.error('Veri çekme hatası:', err);
                setError('Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Makine kartına tıklama işleyicisi
    const handleMachineClick = (machine: Machine) => {
        setSelectedItem(machine);
        setSelectedItemType('machine');
        setDrawerVisible(true);
    };

    // Üretim talimatına tıklama işleyicisi
    const handleProductionClick = (production: ProductionInstruction) => {
        setSelectedItem(production);
        setSelectedItemType('production');
        setDrawerVisible(true);
    };

    // Drawer'ı kapatma işleyicisi
    const closeDrawer = () => {
        setDrawerVisible(false);
    };

    // Verileri yeniden yükleme işleyicisi
    const handleRefresh = async () => {
        try {
            setLoading(true);
            const [machinesResponse, productionsResponse] = await Promise.all([
                apiClient.get(apiUrl.machine),
                apiClient.get(apiUrl.ProductionInsList)
            ]);

            setMachines(machinesResponse.data);
            setProductions(productionsResponse.data);
            setError(null);
        } catch (err) {
            console.error('Veri yenileme hatası:', err);
            setError('Veriler yenilenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    // Makine detayları görünümü
    const renderMachineDetails = () => {
        const machine = selectedItem as Machine;
        if (!machine) return null;

        // Makine ile ilgili üretim talimatlarını bul
        const relatedProductions = productions.filter(prod =>
            prod.productionToMachines.some(ptm => ptm.machineId === machine.id)
        );

        return (
            <>
                <Title level={4}>Makine Detayları</Title>
                <Divider/>

                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Text strong>Makine Adı:</Text> {machine.name}
                    </Col>
                    <Col span={12}>
                        <Text strong>Model:</Text> {machine.model}
                    </Col>
                    <Col span={12}>
                        <Text strong>Üretici:</Text> {machine.manufacturer}
                    </Col>
                    <Col span={12}>
                        <Text strong>Seri No:</Text> {machine.serialNumber}
                    </Col>
                    <Col span={12}>
                        <Text strong>Durum:</Text>{' '}
                        {machine.isOperational ? (
                            <Tag color="green">Çalışıyor</Tag>
                        ) : (
                            <Tag color="red">Çalışmıyor</Tag>
                        )}
                    </Col>
                    <Col span={12}>
                        <Text strong>Arıza Sayısı:</Text> {machine.totalFault}
                    </Col>
                    <Col span={12}>
                        <Text strong>Konum:</Text> {machine.location}
                    </Col>
                    <Col span={12}>
                        <Text strong>Son Bakım:</Text>{' '}
                        {new Date(machine.lastMaintenanceDate).toLocaleDateString('tr-TR')}
                    </Col>
                    <Col span={24}>
                        <Text strong>Açıklama:</Text> {machine.description}
                    </Col>
                </Row>

                <Divider/>
                <Title level={5}>İlgili Üretim Talimatları ({relatedProductions.length})</Title>

                {relatedProductions.length > 0 ? (
                    <Table
                        dataSource={relatedProductions}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        columns={[
                            {
                                title: 'Talimat Adı',
                                dataIndex: 'title',
                                key: 'title',
                            },
                            {
                                title: 'Durum',
                                dataIndex: 'isComplated',
                                key: 'isComplated',
                                render: (_, record) => {
                                    if (record.isComplated === 1) {
                                        return <Tag color="green">Tamamlandı</Tag>;
                                    }
                                    if (record.isDeleted === 1) {
                                        return <Tag color="red">İptal Edildi</Tag>;
                                    }
                                    if (!record.machineId || record.machineId <= 0) {
                                        return <Tag color="red">Henüz Başlanmadı</Tag>;
                                    }

                                    return <Tag color="blue">Devam Ediyor</Tag>;
                                }
                            },
                            {
                                title: 'Oluşturulma',
                                dataIndex: 'insertDate',
                                key: 'insertDate',
                                render: (date) => new Date(date).toLocaleDateString('tr-TR')
                            }
                        ]}
                    />
                ) : (
                    <Empty description="Bu makineye atanmış üretim talimatı bulunamadı"/>
                )}
            </>
        );
    };

    // Üretim detayları görünümü
    const renderProductionDetails = () => {
        const production = selectedItem as ProductionInstruction;
        if (!production) return null;

        return (
            <>
                <Title level={4}>Üretim Talimatı Detayları</Title>
                <Divider/>

                <Row gutter={[16, 16]}>
                    <Col span={18}>
                        <Text strong>Talimat Adı:</Text> {production.title}
                    </Col>
                    <Col span={6}>
                        <Text strong>Durum:</Text>{' '}
                        {production.isComplated === 1 ? (
                            <Tag color="green">Tamamlandı</Tag>
                        ) : production.isDeleted === 1 ? (
                            <Tag color="red">İptal Edildi</Tag>
                        ) : !production.machineId || production.machineId === 0 ? (
                            <Tag color="red">Henüz Başlanmadı</Tag>
                        ) : (
                            <Tag color="blue">Devam Ediyor</Tag>
                        )}
                    </Col>
                    <Col span={12}>
                        <Text strong>Oluşturulma:</Text>{' '}
                        {new Date(production.insertDate).toLocaleDateString('tr-TR')}
                    </Col>
                    {production.complatedDate && (
                        <Col span={12}>
                            <Text strong>Tamamlanma:</Text>{' '}
                            {new Date(production.complatedDate).toLocaleDateString('tr-TR')}
                        </Col>
                    )}
                    <Col span={24}>
                        <Text strong>Açıklama:</Text> {production.description}
                    </Col>
                </Row>

                <Divider/>

                <Tabs defaultActiveKey="machines">
                    <TabPane tab="Makineler" key="machines">
                        {production.productionToMachines.length > 0 ? (
                            <Table
                                dataSource={production.productionToMachines}
                                rowKey="id"
                                pagination={false}
                                size="small"
                                columns={[
                                    {
                                        title: 'Makine Adı',
                                        dataIndex: ['machine', 'name'],
                                        key: 'machineName',
                                    },
                                    {
                                        title: 'Hat',
                                        dataIndex: 'line',
                                        key: 'line',
                                    },
                                    {
                                        title: 'Giriş Tarihi',
                                        dataIndex: 'entryDate',
                                        key: 'entryDate',
                                        render: (date) => new Date(date).toLocaleDateString('tr-TR')
                                    },
                                    {
                                        title: 'Çıkış Tarihi',
                                        dataIndex: 'exitDate',
                                        key: 'exitDate',
                                        render: (date) => date ? new Date(date).toLocaleDateString('tr-TR') : '-'
                                    },
                                    {
                                        title: 'Durum',
                                        key: 'status',
                                        render: (_, record) => (
                                            record.machine.isOperational ?
                                                <Tag color="green">Çalışıyor</Tag> :
                                                <Tag color="red">Çalışmıyor</Tag>
                                        )
                                    }
                                ]}
                            />
                        ) : (
                            <Empty description="Bu talimata atanmış makine bulunamadı"/>
                        )}
                    </TabPane>
                    <TabPane tab="Ürünler" key="products">
                        {production.productionStores.length > 0 ? (
                            <Table
                                dataSource={production.productionStores}
                                rowKey="id"
                                pagination={false}
                                size="small"
                                columns={[
                                    {
                                        title: 'Ürün Adı',
                                        dataIndex: 'name',
                                        key: 'name',
                                    },
                                    {
                                        title: 'Barkod',
                                        dataIndex: 'barkod',
                                        key: 'barkod',
                                    }
                                ]}
                            />
                        ) : (
                            <Empty description="Bu talimata bağlı ürün bulunamadı"/>
                        )}
                    </TabPane>
                </Tabs>
            </>
        );
    };

    // Her makine için ilgili üretim talimatlarını bulma
    const findRelatedProductionsForMachine = (machineId: number) => {
        return productions.filter(prod =>
            prod.productionToMachines.some(ptm => ptm.machineId === machineId)
        );
    };

    // Yükleme durumu kontrolü
    if (loading && machines.length === 0 && productions.length === 0) {
        return (
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                <Spin size="large" tip="Veriler yükleniyor..."/>
            </div>
        );
    }

    return (
        <>
            <HeaderComponent onToggleMenu={onToggleMenu}/>
            <Layout style={{minHeight: '100vh', marginTop: 40}}>
                <Header style={{background: '#fff', padding: '0 20px', boxShadow: '0 1px 4px rgba(0,21,41,.08)'}}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        height: '100%'
                    }}>
                        <Title level={3} style={{margin: 0}}>
                            <ToolOutlined/> Üretim Talimatı ve Makine Takip
                        </Title>
                        <Button
                            icon={<ReloadOutlined/>}
                            onClick={handleRefresh}
                            loading={loading}
                        >
                            Yenile
                        </Button>
                    </div>
                </Header>

                <Content style={{padding: '20px'}}>
                    {error && (
                        <Alert
                            message="Hata"
                            description={error}
                            type="error"
                            showIcon
                            style={{marginBottom: 16}}
                            action={
                                <Button size="small" danger onClick={handleRefresh}>
                                    Tekrar Dene
                                </Button>
                            }
                        />
                    )}

                    <Title level={4}>
                        <InfoCircleOutlined/> İstasyonlar ve Üretim Durumları
                    </Title>

                    <Row gutter={[16, 16]}>
                        {machines.map(machine => {
                            const relatedProductions = findRelatedProductionsForMachine(machine.id);
                            const activeProductions = relatedProductions.filter(p => p.isComplated === 0 && p.isDeleted === 0);

                            return (
                                <Col xs={24} sm={12} md={8} lg={6} key={machine.id}>
                                    <Card
                                        title={
                                            <Space>
                                                {machine.name}
                                                <Badge
                                                    count={activeProductions.length}
                                                    style={{backgroundColor: activeProductions.length > 0 ? '#1890ff' : '#d9d9d9'}}
                                                />
                                            </Space>
                                        }
                                        extra={
                                            machine.isOperational ? (
                                                <Badge status="success" text="Çalışıyor"/>
                                            ) : (
                                                <Badge status="error" text="Çalışmıyor"/>
                                            )
                                        }
                                        hoverable
                                        onClick={() => handleMachineClick(machine)}
                                        style={{height: '100%'}}
                                    >
                                        <Space direction="vertical" style={{width: '100%'}}>
                                            <div>
                                                <Text type="secondary">{machine.model}</Text>
                                            </div>
                                            <div>
                                                <Text type="secondary">
                                                    <ClockCircleOutlined/> Son Bakım:{' '}
                                                    {new Date(machine.lastMaintenanceDate).toLocaleDateString('tr-TR')}
                                                </Text>
                                            </div>
                                            <Divider style={{margin: '8px 0'}}/>
                                            <div>
                                                <Text strong>Aktif Talimatlar</Text>
                                            </div>

                                            {activeProductions.length > 0 ? (
                                                activeProductions.map(prod => (
                                                    <div
                                                        key={prod.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleProductionClick(prod);
                                                        }}
                                                        style={{
                                                            padding: '8px',
                                                            border: '1px solid #f0f0f0',
                                                            borderRadius: '4px',
                                                            marginBottom: '8px',
                                                            cursor: 'pointer',
                                                            background: '#f9f9f9'
                                                        }}
                                                    >
                                                        <Text ellipsis style={{
                                                            width: '100%',
                                                            display: 'block'
                                                        }}>{prod.title}</Text>
                                                        <Text type="secondary" style={{fontSize: '12px'}}>
                                                            Oluşturulma: {new Date(prod.insertDate).toLocaleDateString('tr-TR')}
                                                        </Text>
                                                    </div>
                                                ))
                                            ) : (
                                                <Empty
                                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                    description="Aktif talimat yok"
                                                    style={{margin: '8px 0'}}
                                                />
                                            )}
                                        </Space>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>

                    <Divider/>

                    <Title level={4}>
                        <InfoCircleOutlined/> Tüm Üretim Talimatları
                    </Title>

                    <Row gutter={[16, 16]}>
                        {productions.map(production => (
                            <Col xs={24} sm={12} md={8} lg={6} key={production.id}>
                                <Card
                                    title={production.title}
                                    extra={
                                        production.isComplated === 1 ? (
                                            <Tag color="green">Tamamlandı</Tag>
                                        ) : production.isDeleted === 1 ? (
                                            <Tag color="red">İptal Edildi</Tag>
                                        ) : !production.machineId || production.machineId === 0 ? (
                                            <Tag color="red">Henüz Başlanmadı</Tag>
                                        ) : (
                                            <Tag color="blue">Devam Ediyor</Tag>
                                        )
                                    }
                                    hoverable
                                    onClick={() => handleProductionClick(production)}
                                    style={{height: '100%'}}
                                >
                                    <Space direction="vertical" style={{width: '100%'}}>
                                        <div>
                                            <Text type="secondary">
                                                Oluşturulma: {new Date(production.insertDate).toLocaleDateString('tr-TR')}
                                            </Text>
                                        </div>
                                        {production.description && (
                                            <div>
                                                <Text ellipsis>{production.description}</Text>
                                            </div>
                                        )}
                                        <Divider style={{margin: '8px 0'}}/>
                                        <div>
                                            <Text strong>Atanmış Makineler
                                                ({production.productionToMachines.length})</Text>
                                        </div>

                                        {production.productionToMachines.length > 0 ? (
                                            <Row gutter={[8, 8]}>
                                                {production.productionToMachines.map(ptm => {
                                                    const machine = machines.find(m => m.id === ptm.machineId);
                                                    return (
                                                        <Col span={24} key={ptm.id}>
                                                            <div
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    machine && handleMachineClick(machine);
                                                                }}
                                                                style={{
                                                                    padding: '6px',
                                                                    border: '1px solid #f0f0f0',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center'
                                                                }}
                                                            >
                                                                <Text ellipsis style={{maxWidth: '70%'}}>
                                                                    {ptm.machine.name}
                                                                </Text>
                                                                {ptm.machine.isOperational ? (
                                                                    <Badge status="success" text="Çalışıyor"/>
                                                                ) : (
                                                                    <Badge status="error" text="Durdu"/>
                                                                )}
                                                            </div>
                                                        </Col>
                                                    );
                                                })}
                                            </Row>
                                        ) : (
                                            <Empty
                                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                description="Makine atanmamış"
                                                style={{margin: '8px 0'}}
                                            />
                                        )}
                                    </Space>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Content>

                <Drawer
                    title={
                        selectedItemType === 'machine'
                            ? `Makine: ${(selectedItem as Machine)?.name}`
                            : `Üretim Talimatı: ${(selectedItem as ProductionInstruction)?.title}`
                    }
                    placement="right"
                    closable={true}
                    onClose={closeDrawer}
                    visible={drawerVisible}
                    width={600}
                >
                    {selectedItemType === 'machine' ? renderMachineDetails() : renderProductionDetails()}
                </Drawer>
            </Layout>
        </>
    );
};

export default ProductionMachineTracker;