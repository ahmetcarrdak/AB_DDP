import React, {useState, useEffect} from 'react';
import {
    Table, Button, Input, Space, Drawer, Descriptions,
    Card, Divider, Tabs, List, Tag, Typography, Spin, message
} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import {
    SearchOutlined, DownloadOutlined,
    ReloadOutlined, EyeOutlined
} from '@ant-design/icons';
import axios from 'axios';
import * as XLSX from 'xlsx';
import apiClient from "../Utils/ApiClient";
import {apiUrl} from "../Settings";
import HeaderComponent from "../Components/HeaderComponent";

const {TabPane} = Tabs;
const {Title, Text} = Typography;

// Interfaces
interface Machine {
    id: number;
    productionInstructionId: number;
    machineId: number;
    line: number;
    entryDate: string;
    exitDate: string;
    status: any | number;
    machine: {
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
        company: any | null;
        totalFault: number;
        isOperational: boolean;
        createdAt: string;
        updatedAt: string;
    };
}


interface Store {
    id: number;
    productionInstructionId: number;
    name: string;
    barkod: string;
}

interface ProductionInstruction {
    id: number;
    companyId: number;
    title: string;
    machineId: any | number;
    description: string;
    insertDate: string;
    complatedDate: string;
    deletedDate: string;
    isComplated: number;
    isDeleted: number;
    productionToMachines: Machine[];
    productionStores: Store[];
}

// Ana bileşen
const ProductionInstructionSystem: React.FC = () => {
    // State tanımlamaları
    const [data, setData] = useState<ProductionInstruction[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>('');
    const [filteredData, setFilteredData] = useState<ProductionInstruction[]>([]);
    const [detailVisible, setDetailVisible] = useState<boolean>(false);
    const [selectedRecord, setSelectedRecord] = useState<ProductionInstruction | null>(null);

    // Verileri çekme fonksiyonu
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get<ProductionInstruction[]>(apiUrl.ProductionInsList); // Gerçek API endpoint URL'si buraya gelecek
            setData(response.data);
            setFilteredData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Veri çekme hatası:', error);
            message.error('Veriler yüklenirken bir hata oluştu!');
            setLoading(false);
        }
    };

    // Sayfa yüklendiğinde verileri çek
    useEffect(() => {
        fetchData();
    }, []);

    // Arama fonksiyonu
    const handleSearch = (value: string) => {
        setSearchText(value);
        if (!value.trim()) {
            setFilteredData(data);
            return;
        }

        const filtered = data.filter((item) =>
            item.title.toLowerCase().includes(value.toLowerCase()) ||
            item.description.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredData(filtered);
    };

    // Detay modalını açma fonksiyonu
    const showDetail = (record: ProductionInstruction) => {
        setSelectedRecord(record);
        setDetailVisible(true);
    };

    // Detay modalını kapatma fonksiyonu
    const closeDetail = () => {
        setDetailVisible(false);
    };

    // Excel indirme fonksiyonu
    const exportToExcel = () => {
        // Düzleştirilmiş veri hazırlama (productionToMachines ve productionStores dizilerini çıkarmak için)
        const exportData = filteredData.map(item => {
            const {productionToMachines, productionStores, ...rest} = item;
            return {
                ...rest,
                makineSayisi: productionToMachines?.length || 0,
                depoSayisi: productionStores?.length || 0
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Üretim Talimatları");
        XLSX.writeFile(workbook, "uretim_talimatlari.xlsx");
        message.success('Excel dosyası başarıyla indirildi!');
    };

    // Tarih formatını düzenleme fonksiyonu
    const formatDate = (dateString: string) => {
        if (!dateString || dateString.includes('0001-01-01')) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR');
        } catch (error) {
            return '-';
        }
    };

    // Tablo sütunları
    const columns: ColumnsType<ProductionInstruction> = [
        {
            title: 'Başlık',
            dataIndex: 'title',
            key: 'title',
            sorter: (a, b) => a.title.localeCompare(b.title),
        },
        {
            title: 'Açıklama',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Eklenme Tarihi',
            dataIndex: 'insertDate',
            key: 'insertDate',
            render: (text) => formatDate(text),
            sorter: (a, b) => new Date(a.insertDate).getTime() - new Date(b.insertDate).getTime(),
        },
        {
            title: 'Durum',
            key: 'status',
            render: (_, record) => {
                if (!record.machineId || record.machineId <= 0) {
                    return <Tag color="red">Henüz Başlanmadı</Tag>;
                }

                return (
                    <Tag color={record.isComplated ? 'green' : 'blue'}>
                        {record.isComplated ? 'Tamamlandı' : 'Devam Ediyor'}
                    </Tag>
                );
            },
            filters: [
                {text: 'Tamamlandı', value: 'completed'},
                {text: 'Devam Ediyor', value: 'ongoing'},
                {text: 'Henüz Başlanmadı', value: 'not_started'}
            ],
            onFilter: (value, record) => {
                if (!record.machineId || record.machineId <= 0) {
                    return value === 'not_started';
                }
                return value === 'completed'
                    ? record.isComplated === 1
                    : record.isComplated === 0;
            },
        },
        {
            title: 'İşlemler',
            key: 'actions',
            render: (_, record) => (
                <Button
                    type="primary"
                    icon={<EyeOutlined/>}
                    onClick={() => showDetail(record)}
                >
                    Detay
                </Button>
            ),
        },
    ];

    return (
        <>
            <HeaderComponent/>
            <div style={{padding: '20px'}}>
                <Card>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 16}}>
                        <Title level={4}>Üretim Talimatları</Title>

                        <Space>
                            <Input
                                placeholder="Ara..."
                                prefix={<SearchOutlined/>}
                                value={searchText}
                                onChange={(e) => handleSearch(e.target.value)}
                                style={{width: 250}}
                                allowClear
                            />

                            <Button
                                type="primary"
                                icon={<DownloadOutlined/>}
                                onClick={exportToExcel}
                                disabled={filteredData.length === 0}
                            >
                                Excel İndir
                            </Button>

                            <Button
                                icon={<ReloadOutlined/>}
                                onClick={fetchData}
                            >
                                Yenile
                            </Button>
                        </Space>
                    </div>

                    <Table<ProductionInstruction>
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Toplam ${total} kayıt`
                        }}
                        locale={{emptyText: 'Veri bulunamadı'}}
                    />
                </Card>

                {/* Detay Modal (Drawer) */}
                <Drawer
                    title={selectedRecord ? `"${selectedRecord.title}" Detayları` : 'Detaylar'}
                    placement="right"
                    onClose={closeDetail}
                    open={detailVisible}
                    width="50%"
                    height="100%"
                    destroyOnClose={true}
                >
                    {selectedRecord ? (
                        <div>
                            <Card bordered={false}>
                                <Descriptions title="Talimat Bilgileri" bordered column={1}>
                                    <Descriptions.Item label="Başlık">{selectedRecord.title}</Descriptions.Item>
                                    <Descriptions.Item label="Açıklama">{selectedRecord.description}</Descriptions.Item>
                                    <Descriptions.Item
                                        label="Eklenme Tarihi">{formatDate(selectedRecord.insertDate)}</Descriptions.Item>

                                    {selectedRecord.isComplated === 1 && (
                                        <Descriptions.Item label="Tamamlanma Tarihi">
                                            {formatDate(selectedRecord.complatedDate)}
                                        </Descriptions.Item>
                                    )}

                                    <Descriptions.Item label="Durum">
                                        {selectedRecord.machineId === 0 || selectedRecord.machineId === null ? (
                                            <Tag color="red">Henüz Başlanmadı</Tag>
                                        ) : (
                                            <Tag color={selectedRecord.isComplated ? 'green' : 'blue'}>
                                                {selectedRecord.isComplated ? 'Tamamlandı' : 'Devam Ediyor'}
                                            </Tag>
                                        )}
                                    </Descriptions.Item>

                                </Descriptions>
                            </Card>

                            <Divider/>

                            <Tabs defaultActiveKey="1">
                                <TabPane tab="Makine Bilgileri" key="1">
                                    {selectedRecord.productionToMachines && selectedRecord.productionToMachines.length > 0 ? (
                                        <List
                                            itemLayout="horizontal"
                                            dataSource={selectedRecord.productionToMachines}
                                            renderItem={(item: Machine) => {
                                                let bgColor = "white";
                                                let statusText = "";

                                                switch (item.status) {
                                                    case 0:
                                                        bgColor = "#f0f0f0"; // Gri
                                                        statusText = "Bu makineye henüz gelmedi";
                                                        break;
                                                    case 1:
                                                        bgColor = "#d4edda"; // Açık yeşil
                                                        statusText = "Şu an bu makinede işlem görmekte";
                                                        break;
                                                    case 2:
                                                        bgColor = "#d1ecf1"; // Açık mavi
                                                        statusText = "Bu makinedeki işlem tamamlandı";
                                                        break;
                                                }

                                                return (
                                                    <List.Item>
                                                        <Card
                                                            style={{width: '100%', backgroundColor: bgColor}}
                                                            title={`${item.machine.name} - ${statusText}`}
                                                        >
                                                            <Descriptions column={1} bordered>
                                                                <Descriptions.Item
                                                                    label="İşlem Sırası">{item.line}</Descriptions.Item>
                                                                <Descriptions.Item
                                                                    label="Giriş Tarihi">{formatDate(item.entryDate)}</Descriptions.Item>
                                                                <Descriptions.Item
                                                                    label="Çıkış Tarihi">{formatDate(item.exitDate)}</Descriptions.Item>
                                                            </Descriptions>
                                                        </Card>
                                                    </List.Item>
                                                );
                                            }}
                                        />
                                    ) : (
                                        <Text italic>Makine kaydı bulunamadı</Text>
                                    )};
                                </TabPane>

                                <TabPane tab="Yarı Mamül Bilgileri" key="2">
                                    {selectedRecord.productionStores && selectedRecord.productionStores.length > 0 ? (
                                        <List
                                            itemLayout="horizontal"
                                            dataSource={selectedRecord.productionStores}
                                            renderItem={(item: Store) => (
                                                <List.Item>
                                                    <Card style={{width: '100%'}} title={item.name}>
                                                        <Descriptions column={1} bordered>
                                                            <Descriptions.Item
                                                                label="Barkod">{item.barkod}</Descriptions.Item>
                                                        </Descriptions>
                                                    </Card>
                                                </List.Item>
                                            )}
                                        />
                                    ) : (
                                        <Text italic>Yarı Mamül kaydı bulunamadı</Text>
                                    )}
                                </TabPane>
                            </Tabs>
                        </div>
                    ) : (
                        <Spin tip="Yükleniyor..."/>
                    )}
                </Drawer>
            </div>
        </>
    );
};

export default ProductionInstructionSystem;