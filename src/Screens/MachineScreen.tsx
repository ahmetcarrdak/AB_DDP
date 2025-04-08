import React, {useEffect, useState, useRef} from "react";
import {Link, useNavigate} from "react-router-dom";
import HeaderComponent from "../Components/HeaderComponent";
import {
    Table,
    Button,
    Input,
    Space,
    Card,
    Tag,
    Drawer,
    Form,
    message,
    Typography,
    Row,
    Col,
    Select,
    DatePicker,
    Modal,
    QRCode,
    Dropdown,
    Badge,
    Tooltip,
    Popconfirm,
    Descriptions,
    Divider
} from "antd";
import {
    DownloadOutlined,
    PlusOutlined,
    FilterOutlined,
    ReloadOutlined,
    QrcodeOutlined,
    MoreOutlined,
    FileExcelOutlined,
    FilePdfOutlined,
    BarcodeOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined
} from "@ant-design/icons";
import {apiUrl} from "../Settings";
import type {ColumnsType} from "antd/es/table";
import moment from "moment";
import {Dayjs} from "dayjs";
import apiClient from "../Utils/ApiClient";
import * as XLSX from 'xlsx';
import {jsPDF} from 'jspdf';
import html2canvas from 'html2canvas';
import Barcode from "react-barcode";
import 'antd/dist/reset.css';
import * as htmlToImage from "html-to-image";

const {Title, Text} = Typography;
const {Option} = Select;

interface MachineRecord {
    id: number;
    name: string;
    barcode: string;
    serialNumber: string;
    location: string;
    manufacturer: string;
    model: string;
    totalFault: number;
    purchaseDate: string;
    isOperational: boolean;
    purchasePrice: number;
    description: string;
    dimensions: string;
    weight: string;
    powerConsumption: string;
    warrantyPeriod: number;
    lastMaintenanceDate: string;
    nextMaintenanceDate: string;
}

const MachineScreen: React.FC<{ onToggleMenu: () => void }> = ({onToggleMenu}) => {
    // State'ler
    const [data, setData] = useState<MachineRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [filters, setFilters] = useState({
        location: "",
        manufacturer: "",
        isOperational: null as boolean | null,
        dateRange: null as [Dayjs | null, Dayjs | null] | null
    });
    const [qrModalVisible, setQrModalVisible] = useState(false);
    const [barcodeModalVisible, setBarcodeModalVisible] = useState(false);
    const [currentBarcode, setCurrentBarcode] = useState("");
    const [qrUrl, setQrUrl] = useState("");
    const [selectedFormat, setSelectedFormat] = useState<string>("png");
    const [machineDetailVisible, setMachineDetailVisible] = useState(false);
    const [selectedMachine, setSelectedMachine] = useState<MachineRecord | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const tableRef = useRef<HTMLDivElement>(null);
    const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
    const navigate = useNavigate();
    const [deletedConfirm, setDeletedCondfirm] = useState(false);

    // Veri çekme
    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(apiUrl.machine);
            setData(response.data);
        } catch (error) {
            message.error("Veri yüklenirken hata oluştu");
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Makine silme fonksiyonu
    const handleDelete = async (id: number) => {
        try {
            setDeleteLoading(true);
            await apiClient.put(`${apiUrl.machine}/Deleted/${id}`);
            message.success("Makine başarıyla silindi");
            fetchData();
        } catch (error) {
            message.error("Makine silinirken hata oluştu");
            console.error("Error:", error);
        } finally {
            setDeleteLoading(false);
        }
    };

    // QR Code işlemleri
    const generateQRCode = (machineId: number) => {
        const link = `${window.location.origin}/QR-Menu/${machineId}`;
        setQrUrl(link);
        setQrModalVisible(true);
    };

    const downloadQRCode = () => {
        try {
            const originalCanvas = document.querySelector('.ant-qrcode canvas') as HTMLCanvasElement;
            if (!originalCanvas) {
                message.error("QR kodu bulunamadı!");
                return;
            }

            const width = originalCanvas.width;
            const height = originalCanvas.height;

            // Yeni canvas oluştur ve beyaz arka plan uygula
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                message.error("Canvas işlemi başarısız");
                return;
            }

            // Arka planı beyaz boya
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);

            // Orijinal canvas'ı yeni canvas'a çiz
            ctx.drawImage(originalCanvas, 0, 0);

            // Bağlantıyı oluştur ve indir
            const link = document.createElement('a');
            link.download = `qr-code.${selectedFormat}`;
            link.href = selectedFormat === 'png'
                ? originalCanvas.toDataURL('image/png')
                : canvas.toDataURL('image/jpeg', 0.92); // bu yeni canvas
            link.click();

            message.success("QR kodu indirildi");
        } catch (error) {
            message.error("QR kodu indirilemedi");
            console.error(error);
        }
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

    // Export işlemleri
    const exportToExcel = () => {
        const exportData = filteredData.map(item => ({
            'Makine Adı': item.name,
            'Barkod': item.barcode,
            'Seri No': item.serialNumber,
            'Konum': item.location,
            'Üretici': item.manufacturer,
            'Model': item.model,
            'Arıza Sayısı': item.totalFault,
            'Satın Alma Tarihi': moment(item.purchaseDate).format("DD.MM.YYYY"),
            'Durum': item.isOperational ? "Aktif" : "Pasif",
            'Satın Alma Fiyatı': `${item.purchasePrice} ₺`,
            'Ağırlık': item.weight,
            'Boyutlar': item.dimensions,
            'Güç Tüketimi': item.powerConsumption,
            'Garanti Süresi': `${item.warrantyPeriod} ay`,
            'Son Bakım Tarihi': item.lastMaintenanceDate ? moment(item.lastMaintenanceDate).format("DD.MM.YYYY") : "-",
            'Sonraki Bakım Tarihi': item.nextMaintenanceDate ? moment(item.nextMaintenanceDate).format("DD.MM.YYYY") : "-"
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Makineler");
        XLSX.writeFile(workbook, "makineler.xlsx");
        message.success("Excel indiriliyor");
    };

    const exportToPDF = async () => {
        if (!tableRef.current) return;

        try {
            message.loading({content: 'PDF hazırlanıyor...', key: 'pdf'});
            const canvas = await html2canvas(tableRef.current);
            const pdf = new jsPDF('landscape');
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, 280, 150);
            pdf.save('makineler.pdf');
            message.success({content: 'PDF indirildi', key: 'pdf'});
        } catch (error) {
            message.error({content: 'PDF oluşturulamadı', key: 'pdf'});
            console.error(error);
        }
    };

    // Makine detayını göster
    const showMachineDetails = (machine: MachineRecord) => {
        setSelectedMachine(machine);
        setMachineDetailVisible(true);
    };

    // Filtreleme
    const filteredData = data.filter(record => {
        const matchesSearch = Object.values(record).some(value =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        );
        const matchesLocation = !filters.location || record.location === filters.location;
        const matchesManufacturer = !filters.manufacturer || record.manufacturer === filters.manufacturer;
        const matchesOperational = filters.isOperational === null || record.isOperational === filters.isOperational;
        const matchesDateRange = !filters.dateRange || !filters.dateRange[0] || !filters.dateRange[1] ||
            moment(record.purchaseDate).isBetween(
                filters.dateRange[0]?.toDate(),
                filters.dateRange[1]?.toDate(),
                'day',
                '[]'
            );

        return matchesSearch && matchesLocation && matchesManufacturer && matchesOperational && matchesDateRange;
    });

    // Tablo kolonları
    const columns: ColumnsType<MachineRecord> = [
        {
            title: "Makine Adı",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
            fixed: 'left',
            width: 180,
        },
        {
            title: "Barkod",
            dataIndex: "barcode",
            key: "barcode",
            render: (barcode) => (
                <Button
                    type="link"
                    onClick={() => {
                        setCurrentBarcode(barcode);
                        setBarcodeModalVisible(true);
                    }}
                    icon={<BarcodeOutlined/>}
                >
                    {barcode}
                </Button>
            ),
            width: 150,
        },
        {
            title: "Seri No",
            dataIndex: "serialNumber",
            key: "serialNumber",
            width: 120,
        },
        {
            title: "Konum",
            dataIndex: "location",
            key: "location",
            width: 120,
        },
        {
            title: "Üretici",
            dataIndex: "manufacturer",
            key: "manufacturer",
            width: 120,
        },
        {
            title: "Model",
            dataIndex: "model",
            key: "model",
            width: 120,
        },
        {
            title: "Arıza",
            dataIndex: "totalFault",
            key: "totalFault",
            render: (count) => (
                <Badge
                    count={count}
                    showZero
                    style={{backgroundColor: count > 0 ? '#ff4d4f' : '#52c41a'}}
                />
            ),
            width: 100,
        },
        {
            title: "Satın Alma",
            dataIndex: "purchaseDate",
            key: "purchaseDate",
            render: (date) => moment(date).format("DD.MM.YYYY"),
            width: 120,
        },
        {
            title: "Durum",
            dataIndex: "isOperational",
            key: "isOperational",
            render: (operational) => (
                <Tag color={operational ? "green" : "red"}>
                    {operational ? "Aktif" : "Pasif"}
                </Tag>
            ),
            width: 100,
        },
        {
            title: "İşlemler",
            key: "actions",
            fixed: 'right',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Detaylar">
                        <Button
                            icon={<EyeOutlined/>}
                            onClick={() => showMachineDetails(record)}
                        />
                    </Tooltip>

                    <Dropdown
                        menu={{
                            items: [
                                {
                                    key: 'edit',
                                    label: 'Düzenle',
                                    icon: <EditOutlined/>,
                                    onClick: () => navigate(`/machine-update-machine/${record.id}`)
                                },
                                {
                                    key: 'qrcode',
                                    label: 'QR Kodu',
                                    icon: <QrcodeOutlined/>,
                                    onClick: () => generateQRCode(record.id),
                                },
                            ]
                        }}
                    >
                        <Button icon={<MoreOutlined/>}/>
                    </Dropdown>
                    <Tooltip title="Sil">
                        <Button
                            icon={<DeleteOutlined/>}
                            danger
                            onClick={() => {
                                setSelectedMachine(record);
                                setDeletedCondfirm(true);
                            }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div style={{background: '#f0f2f5', minHeight: '100vh'}}>
            <HeaderComponent onToggleMenu={onToggleMenu}/>

            <Card
                style={{margin: 16, borderRadius: 8}}
                bodyStyle={{padding: 0}}
            >
                <div style={{padding: 24}}>
                    <Row gutter={[16, 16]} justify="space-between" align="middle">
                        <Col>
                            <Title level={4} style={{margin: 0}}>Makine Listesi</Title>
                        </Col>

                        <Col>
                            <Space wrap>
                                <Input.Search
                                    placeholder="Ara..."
                                    allowClear
                                    onSearch={setSearchText}
                                    style={{width: 200}}
                                />

                                <Tooltip title="Yenile">
                                    <Button
                                        icon={<ReloadOutlined/>}
                                        onClick={fetchData}
                                    />
                                </Tooltip>

                                <Button
                                    icon={<FilterOutlined/>}
                                    onClick={() => setFilterDrawerVisible(true)}
                                >
                                    Filtrele
                                </Button>

                                <Dropdown
                                    menu={{
                                        items: [
                                            {
                                                key: 'excel',
                                                label: 'Excel',
                                                icon: <FileExcelOutlined/>,
                                                onClick: exportToExcel
                                            },
                                            {
                                                key: 'pdf',
                                                label: 'PDF',
                                                icon: <FilePdfOutlined/>,
                                                onClick: exportToPDF
                                            }
                                        ]
                                    }}
                                >
                                    <Button icon={<DownloadOutlined/>}>Dışa Aktar</Button>
                                </Dropdown>

                                <Link to="/machine-create">
                                    <Button type="primary" icon={<PlusOutlined/>}>
                                        Yeni Makine
                                    </Button>
                                </Link>
                            </Space>
                        </Col>
                    </Row>
                </div>

                <div ref={tableRef}>
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        loading={loading}
                        rowKey="id"
                        scroll={{x: 1300}}
                        pagination={{
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total) => `Toplam ${total} makine`,
                            pageSizeOptions: ["10", "25", "50", "100"],
                        }}
                    />
                </div>
            </Card>

            {/* Filtre Drawer */}
            <Drawer
                title="Filtrele"
                placement="right"
                onClose={() => setFilterDrawerVisible(false)}
                open={filterDrawerVisible}
                width={300}
            >
                <Form layout="vertical">
                    <Form.Item label="Konum">
                        <Select
                            allowClear
                            placeholder="Tüm konumlar"
                            onChange={(value) => setFilters({...filters, location: value})}
                        >
                            {Array.from(new Set(data.map(item => item.location))).map(location => (
                                <Option key={location} value={location}>{location}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Üretici">
                        <Select
                            allowClear
                            placeholder="Tüm üreticiler"
                            onChange={(value) => setFilters({...filters, manufacturer: value})}
                        >
                            {Array.from(new Set(data.map(item => item.manufacturer))).map(manufacturer => (
                                <Option key={manufacturer} value={manufacturer}>{manufacturer}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Durum">
                        <Select
                            allowClear
                            placeholder="Tüm durumlar"
                            onChange={(value) => setFilters({...filters, isOperational: value})}
                        >
                            <Option value={true}>Aktif</Option>
                            <Option value={false}>Pasif</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Tarih Aralığı">
                        <DatePicker.RangePicker
                            style={{width: '100%'}}
                            onChange={(dates) => setFilters({
                                ...filters,
                                dateRange: dates as [Dayjs | null, Dayjs | null] | null
                            })}
                        />
                    </Form.Item>
                </Form>
            </Drawer>


            {/*  Machine Deleted Modal */}
            <Modal
                title="Makine Silme Onayı"
                open={deletedConfirm}
                onCancel={() => setDeletedCondfirm(false)}
                footer={[
                    <Button key="cancel" onClick={() => setDeletedCondfirm(false)}>
                        İptal
                    </Button>,
                    <Button
                        key="delete"
                        type="primary"
                        danger
                        loading={deleteLoading}
                        onClick={() => {
                            if (selectedMachine) {
                                handleDelete(selectedMachine.id);
                                setDeletedCondfirm(false);
                            }
                        }}
                        icon={<DeleteOutlined/>}
                    >
                        Sil
                    </Button>
                ]}
            >
                <Text>
                    <strong>{selectedMachine?.name}</strong> isimli makineyi silmek istediğinize emin misiniz?
                    <br/>
                    Bu işlem silinen makineler sayfasından geri alabilirsiniz!
                </Text>
            </Modal>

            {/* QR Code Modal */}
            <Modal
                title="QR Kodu"
                open={qrModalVisible}
                onCancel={() => setQrModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setQrModalVisible(false)}>
                        Kapat
                    </Button>,
                    <Button
                        key="download"
                        type="primary"
                        onClick={downloadQRCode}
                        icon={<DownloadOutlined/>}
                    >
                        İndir ({selectedFormat.toUpperCase()})
                    </Button>
                ]}
            >
                <div style={{textAlign: 'center'}}>
                    <QRCode
                        value={qrUrl}
                        size={200}
                        style={{marginBottom: 16}}
                    />
                    <Text copyable>{qrUrl}</Text>
                    <Form.Item label="Format" style={{marginTop: 16}}>
                        <Select
                            value={selectedFormat}
                            onChange={setSelectedFormat}
                            style={{width: 120}}
                        >
                            <Option value="png">PNG</Option>
                            <Option value="jpeg">JPEG</Option>
                        </Select>
                    </Form.Item>
                </div>
            </Modal>

            {/* Barcode Modal */}
            <Modal
                title="Barkod Bilgisi"
                open={barcodeModalVisible}
                onCancel={() => setBarcodeModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setBarcodeModalVisible(false)}>
                        Kapat
                    </Button>,
                    <Button
                        key="download"
                        type="primary"
                        icon={<DownloadOutlined/>}
                        onClick={downloadBarcode}
                    >
                        PNG Olarak İndir
                    </Button>
                ]}
                centered
                width={600}
            >
                <div style={{textAlign: 'center', padding: 24}} className={"barcode-container"}>
                    <Barcode
                        value={currentBarcode || ''}
                        width={2}
                        height={100}
                        fontSize={16}
                        margin={10}
                    />

                    <Text strong style={{fontSize: 18, display: 'block', margin: '16px 0'}}>
                        {currentBarcode}
                    </Text>

                    <Space>
                        <Button
                            type="primary"
                            onClick={() => {
                                navigator.clipboard.writeText(currentBarcode);
                                message.success('Barkod panoya kopyalandı!');
                            }}
                        >
                            Metni Kopyala
                        </Button>
                    </Space>
                </div>
            </Modal>

            {/* Makine Detay Drawer */}
            <Drawer
                title={`Makine Detayları: ${selectedMachine?.name || ''}`}
                placement="right"
                width={600}
                onClose={() => setMachineDetailVisible(false)}
                open={machineDetailVisible}
                extra={
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => {
                                if (selectedMachine) {
                                    navigate(`/machine-update-machine/${selectedMachine.id}`);
                                }
                            }}
                            icon={<EditOutlined/>}
                        >
                            Düzenle
                        </Button>
                        <Button onClick={() => setMachineDetailVisible(false)}>Kapat</Button>
                    </Space>
                }
            >
                {selectedMachine && (
                    <div>
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Makine Adı">{selectedMachine.name}</Descriptions.Item>
                            <Descriptions.Item label="Barkod">
                                <Button
                                    type="link"
                                    onClick={() => {
                                        setCurrentBarcode(selectedMachine.barcode);
                                        setBarcodeModalVisible(true);
                                    }}
                                    icon={<BarcodeOutlined/>}
                                >
                                    {selectedMachine.barcode}
                                </Button>
                            </Descriptions.Item>
                            <Descriptions.Item label="Seri Numarası">{selectedMachine.serialNumber}</Descriptions.Item>
                            <Descriptions.Item label="Konum">{selectedMachine.location}</Descriptions.Item>
                            <Descriptions.Item label="Üretici">{selectedMachine.manufacturer}</Descriptions.Item>
                            <Descriptions.Item label="Model">{selectedMachine.model}</Descriptions.Item>
                            <Descriptions.Item label="Arıza Sayısı">
                                <Badge
                                    count={selectedMachine.totalFault}
                                    showZero
                                    style={{backgroundColor: selectedMachine.totalFault > 0 ? '#ff4d4f' : '#52c41a'}}
                                />
                            </Descriptions.Item>
                            <Descriptions.Item label="Durum">
                                <Tag color={selectedMachine.isOperational ? "green" : "red"}>
                                    {selectedMachine.isOperational ? "Aktif" : "Pasif"}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left">Teknik Özellikler</Divider>
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Satın Alma Tarihi">
                                {moment(selectedMachine.purchaseDate).format("DD.MM.YYYY")}
                            </Descriptions.Item>
                            <Descriptions.Item label="Satın Alma Fiyatı">
                                {selectedMachine.purchasePrice} ₺
                            </Descriptions.Item>
                            <Descriptions.Item label="Ağırlık">{selectedMachine.weight}</Descriptions.Item>
                            <Descriptions.Item label="Boyutlar">{selectedMachine.dimensions}</Descriptions.Item>
                            <Descriptions.Item
                                label="Güç Tüketimi">{selectedMachine.powerConsumption}</Descriptions.Item>
                            <Descriptions.Item label="Garanti Süresi">
                                {selectedMachine.warrantyPeriod} ay
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left">Bakım Bilgileri</Divider>
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Son Bakım Tarihi">
                                {selectedMachine.lastMaintenanceDate ?
                                    moment(selectedMachine.lastMaintenanceDate).format("DD.MM.YYYY") : "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Sonraki Bakım Tarihi">
                                {selectedMachine.nextMaintenanceDate ?
                                    moment(selectedMachine.nextMaintenanceDate).format("DD.MM.YYYY") : "-"}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left">Açıklama</Divider>
                        <Card>
                            {selectedMachine.description || "Açıklama bulunmamaktadır."}
                        </Card>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default MachineScreen;