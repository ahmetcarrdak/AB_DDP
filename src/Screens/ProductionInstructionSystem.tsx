import React, {useState, useEffect, useRef} from 'react';
import {
    Table, Button, Input, Space, Drawer, Descriptions,
    Card, Divider, Tabs, List, Tag, Typography, Spin, message, Modal, Statistic
} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import {
    SearchOutlined, DownloadOutlined,
    ReloadOutlined, EyeOutlined, PlusOutlined, BarcodeOutlined
} from '@ant-design/icons';
import axios from 'axios';
import * as XLSX from 'xlsx';
import apiClient from "../Utils/ApiClient";
import {apiUrl} from "../Settings";
import HeaderComponent from "../Components/HeaderComponent";
import {Link} from "react-router-dom";
import Barcode from 'react-barcode';
import * as htmlToImage from 'html-to-image';

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
    barcode: string;
    machine: {
        id: number;
        companyId: number;
        name: string;
        barcode: string;
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
    machineId: any | number;
    barcode: string;
    description: string;
    insertDate: string;
    complatedDate: string;
    deletedDate: string;
    isComplated: number;
    isDeleted: number;
    count: number;
    productionToMachines: Machine[];
    productionStores: Store[];
    productToSeans: ProductToSeans[];
}

interface ProdutionInstructionProps {
    onToggleMenu: () => void;
}

// Ana bileşen
const ProductionInstructionSystem: React.FC<ProdutionInstructionProps> = ({onToggleMenu}) => {
    // State tanımlamaları
    const [data, setData] = useState<ProductionInstruction[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>('');
    const [filteredData, setFilteredData] = useState<ProductionInstruction[]>([]);
    const [detailVisible, setDetailVisible] = useState<boolean>(false);
    const [selectedRecord, setSelectedRecord] = useState<ProductionInstruction | null>(null);
    const [barcodeModalVisible, setBarcodeModalVisible] = useState<boolean>(false);
    const [currentBarcode, setCurrentBarcode] = useState<string>('');
    const barcodeRef = useRef<HTMLDivElement>(null);

    // Verileri çekme fonksiyonu
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get<ProductionInstruction[]>(apiUrl.ProductionInsList);
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
            item.description.toLowerCase().includes(value.toLowerCase()) ||
            item.barcode.toLowerCase().includes(value.toLowerCase())
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
        const exportData = filteredData.map(item => {
            const totalCompleted = item.productToSeans?.filter(s => s.isCompleted).reduce((sum, s) => sum + s.count, 0) || 0;

            return {
                'ID': item.id,
                'Başlık': item.title,
                'Barkod': item.barcode,
                'Açıklama': item.description,
                'Toplam Adet': item.count,
                'Tamamlanan Adet': totalCompleted,
                'Kalan Adet': item.count - totalCompleted,
                'Durum': totalCompleted === 0 ? 'Henüz Başlanmadı' :
                    totalCompleted >= item.count ? 'Tamamlandı' : 'Devam Ediyor',
                'Eklenme Tarihi': formatDate(item.insertDate),
                'Tamamlanma Tarihi': formatDate(item.complatedDate),
                'Makine Sayısı': item.productionToMachines?.length || 0,
                'Depo Sayısı': item.productionStores?.length || 0,
                'Seans Sayısı': item.productToSeans?.length || 0
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

    // Barkod görüntüleme fonksiyonu
    const showBarcode = (barcode: string) => {
        setCurrentBarcode(barcode);
        setBarcodeModalVisible(true);
    };

    // Barkod indirme fonksiyonu
    const downloadBarcode = async () => {
        try {
            const barcodeElement = document.querySelector('.barcode-container svg') as HTMLElement;

            if (!barcodeElement) {
                message.error("Barkod elementi bulunamadı!");
                return;
            }

            // SVG'yi PNG'ye dönüştür
            const dataUrl = await htmlToImage.toPng(barcodeElement);

            // İndirme işlemi
            const link = document.createElement('a');
            link.download = `barcode_${currentBarcode}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            message.success('Barkod başarıyla indirildi!');
        } catch (error) {
            console.error('Barkod indirme hatası:', error);
            message.error('Barkod indirilirken bir hata oluştu!');
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
            title: 'Barkod',
            dataIndex: 'barcode',
            key: 'barcode',
            render: (text) => text ? (
                <Button
                    type="link"
                    onClick={() => showBarcode(text)}
                    style={{padding: 0}}
                >
                    {text}
                </Button>
            ) : '-',
        },
        {
            title: 'Toplam Adet',
            dataIndex: 'count',
            key: 'count',
            sorter: (a, b) => a.count - b.count,
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
                // Eğer hiç makine atanmamışsa
                if ( record.productionToMachines?.every(m => m.status === 0)) {
                    return <Tag color="red">Henüz Başlanmadı</Tag>;
                }

                // Tüm makinelerin durumu 2 ise (Tamamlandı)
                const allMachinesCompleted = record.productionToMachines?.every(m => m.status === 2);
                if (allMachinesCompleted) {
                    return <Tag color="green">Tamamlandı</Tag>;
                }

                // En az bir makinenin durumu 0'dan farklı ise (Devam Ediyor)
                const anyMachineInProgress = record.productionToMachines?.some(m => m.status !== 0);
                if (anyMachineInProgress) {
                    return (
                        <Tag color="blue">
                            Devam Ediyor
                        </Tag>
                    );
                }

                // Diğer durumlar (Henüz başlanmamış)
                return <Tag color="red">Henüz Başlanmadı</Tag>;
            },
            filters: [
                {text: 'Tamamlandı', value: 'completed'},
                {text: 'Devam Ediyor', value: 'ongoing'},
                {text: 'Henüz Başlanmadı', value: 'not_started'}
            ],
            onFilter: (value, record) => {
                if (value === 'completed') {
                    return record.productionToMachines?.every(m => m.status === 2);
                }
                if (value === 'ongoing') {
                    return record.productionToMachines?.some(m => m.status !== 0) &&
                        !record.productionToMachines?.every(m => m.status === 2);
                }
                if (value === 'not_started') {
                    return record.machineId === null || record.machineId < 1 ||
                        record.productionToMachines?.every(m => m.status === 0);
                }
                return true;
            }
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
                    Detaylar
                </Button>
            ),
        },
    ];

    return (
        <>
            <HeaderComponent
                onToggleMenu={onToggleMenu}
            />
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
                            <Link to={"/production-add"}>
                                <Button
                                    type="link"
                                    icon={<PlusOutlined/>}
                                >
                                    Yeni Üretim Talimatı Ekle
                                </Button>
                            </Link>
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

                {/* Barkod Modalı */}
                <Modal
                    title={`Barkod: ${currentBarcode}`}
                    open={barcodeModalVisible}
                    onCancel={() => setBarcodeModalVisible(false)}
                    footer={[
                        <Button key="download" type="primary" onClick={downloadBarcode}>
                            <DownloadOutlined/> İndir
                        </Button>,
                        <Button key="close" onClick={() => setBarcodeModalVisible(false)}>
                            Kapat
                        </Button>
                    ]}
                    width={600}
                >
                    <div className="barcode-container" style={{textAlign: 'center', margin: '20px 0'}}>
                        <Barcode
                            value={currentBarcode || ''}
                            width={2}
                            height={100}
                            fontSize={16}
                            margin={10}
                        />
                    </div>
                </Modal>

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
                                        {(() => {
                                            // Eğer hiç makine atanmamışsa veya tüm makinelerin status'u 0 ise
                                            if (!selectedRecord.productionToMachines?.length ||
                                                selectedRecord.productionToMachines.every(m => m.status === 0)) {
                                                return <Tag color="red">Henüz Başlanmadı</Tag>;
                                            }

                                            // Tüm makinelerin durumu 2 ise (Tamamlandı)
                                            const allMachinesCompleted = selectedRecord.productionToMachines.every(m => m.status === 2);
                                            if (allMachinesCompleted) {
                                                return <Tag color="green">Tamamlandı</Tag>;
                                            }

                                            // En az bir makinenin durumu 0'dan farklı ise (Devam Ediyor)
                                            const anyMachineInProgress = selectedRecord.productionToMachines.some(m => m.status !== 0);
                                            if (anyMachineInProgress) {
                                                return <Tag color="blue">Devam Ediyor</Tag>;
                                            }

                                            // Beklenmedik durumlar için
                                            return <Tag color="purple">Beklenmedik Durum</Tag>;
                                        })()}
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
                                                            title={`${item.machine.name} - ${statusText} - ${item.machine.barcode}`}
                                                        >
                                                            <Descriptions column={1} bordered>
                                                                <Descriptions.Item
                                                                    label="İşlem Sırası">{item.line}</Descriptions.Item>
                                                                {item.status > 0 && (<Descriptions.Item
                                                                        label="Giriş Tarihi">{formatDate(item.entryDate)}</Descriptions.Item>
                                                                )}
                                                                {item.exitDate !== item.entryDate && (
                                                                    <Descriptions.Item
                                                                        label="Çıkış Tarihi">{formatDate(item.exitDate)}</Descriptions.Item>
                                                                )}
                                                            </Descriptions>
                                                        </Card>
                                                    </List.Item>
                                                );
                                            }}
                                        />
                                    ) : (
                                        <Text italic>Makine kaydı bulunamadı</Text>
                                    )}
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