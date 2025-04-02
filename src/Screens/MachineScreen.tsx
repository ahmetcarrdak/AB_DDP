import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
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
    Tooltip
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
    BarcodeOutlined
} from "@ant-design/icons";
import { apiUrl } from "../Settings";
import type { ColumnsType } from "antd/es/table";
import moment from "moment";
import { Dayjs } from "dayjs";
import apiClient from "../Utils/ApiClient";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Barcode from "react-barcode";

const { Title, Text } = Typography;
const { Option } = Select;

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
}

const MachineScreen: React.FC<{ onToggleMenu: () => void }> = ({ onToggleMenu }) => {
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
    const tableRef = useRef<HTMLDivElement>(null);
    const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);

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

    // QR Code işlemleri
    const generateQRCode = (machineId: number) => {
        const link = `${window.location.origin}/QR-Menu/${machineId}`;
        setQrUrl(link);
        setQrModalVisible(true);
    };

    const downloadQRCode = () => {
        try {
            const canvas = document.querySelector('.ant-qrcode canvas') as HTMLCanvasElement;
            if (!canvas) {
                message.error("QR kodu bulunamadı!");
                return;
            }

            const link = document.createElement('a');
            link.download = `qr-code.${selectedFormat}`;
            link.href = selectedFormat === 'png'
                ? canvas.toDataURL('image/png')
                : canvas.toDataURL('image/jpeg', 0.92);
            link.click();
            message.success("QR kodu indirildi");
        } catch (error) {
            message.error("QR kodu indirilemedi");
            console.error(error);
        }
    };

    // Export işlemleri
    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Makineler");
        XLSX.writeFile(workbook, "makineler.xlsx");
        message.success("Excel indiriliyor");
    };

    const exportToPDF = async () => {
        if (!tableRef.current) return;

        try {
            message.loading({ content: 'PDF hazırlanıyor...', key: 'pdf' });
            const canvas = await html2canvas(tableRef.current);
            const pdf = new jsPDF('landscape');
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, 280, 150);
            pdf.save('makineler.pdf');
            message.success({ content: 'PDF indirildi', key: 'pdf' });
        } catch (error) {
            message.error({ content: 'PDF oluşturulamadı', key: 'pdf' });
            console.error(error);
        }
    };

    // Filtreleme
    const filteredData = data.filter(record => {
        const matchesSearch = Object.values(record).some(value =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        );
        const matchesLocation = !filters.location || record.location === filters.location;
        const matchesManufacturer = !filters.manufacturer || record.manufacturer === filters.manufacturer;
        const matchesOperational = filters.isOperational === null || record.isOperational === filters.isOperational;
        // Filtreleme kısmında tarih karşılaştırmasını güncelleyin:
        const matchesDateRange = !filters.dateRange || !filters.dateRange[0] || !filters.dateRange[1] ||
            moment(record.purchaseDate).isBetween(
                filters.dateRange[0]?.toDate(), // Dayjs -> Date çevrimi
                filters.dateRange[1]?.toDate(), // Dayjs -> Date çevrimi
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
                    icon={<BarcodeOutlined />}
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
                    style={{ backgroundColor: count > 0 ? '#ff4d4f' : '#52c41a' }}
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
            width: 120,
            render: (_, record) => (
                <Dropdown
                    menu={{
                        items: [
                            {
                                key: 'edit',
                                label: (
                                    <Link to={`/machine-update-machine/${record.id}`}>
                                        Düzenle
                                    </Link>
                                ),
                                icon: <PlusOutlined />,
                            },
                            {
                                key: 'qrcode',
                                label: 'QR Kodu',
                                icon: <QrcodeOutlined />,
                                onClick: () => generateQRCode(record.id),
                            },
                        ],
                    }}
                >
                    <Button icon={<MoreOutlined />} />
                </Dropdown>
            ),
        },
    ];

    return (
        <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
            <HeaderComponent onToggleMenu={onToggleMenu} />

            <Card
                style={{ margin: 16, borderRadius: 8 }}
                bodyStyle={{ padding: 0 }}
            >
                <div style={{ padding: 24 }}>
                    <Row gutter={[16, 16]} justify="space-between" align="middle">
                        <Col>
                            <Title level={4} style={{ margin: 0 }}>Makine Listesi</Title>
                        </Col>

                        <Col>
                            <Space wrap>
                                <Input.Search
                                    placeholder="Ara..."
                                    allowClear
                                    onSearch={setSearchText}
                                    style={{ width: 200 }}
                                />

                                <Tooltip title="Yenile">
                                    <Button
                                        icon={<ReloadOutlined />}
                                        onClick={fetchData}
                                    />
                                </Tooltip>

                                <Button
                                    icon={<FilterOutlined />}
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
                                                icon: <FileExcelOutlined />,
                                                onClick: exportToExcel
                                            },
                                            {
                                                key: 'pdf',
                                                label: 'PDF',
                                                icon: <FilePdfOutlined />,
                                                onClick: exportToPDF
                                            }
                                        ]
                                    }}
                                >
                                    <Button icon={<DownloadOutlined />}>Dışa Aktar</Button>
                                </Dropdown>

                                <Link to="/machine-create">
                                    <Button type="primary" icon={<PlusOutlined />}>
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
                        scroll={{ x: 1300 }}
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
                            style={{ width: '100%' }}
                            onChange={(dates) => setFilters({
                                ...filters,
                                dateRange: dates as [Dayjs | null, Dayjs | null] | null
                            })}
                        />
                    </Form.Item>
                </Form>
            </Drawer>

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
                        icon={<DownloadOutlined />}
                    >
                        İndir ({selectedFormat.toUpperCase()})
                    </Button>
                ]}
            >
                <div style={{ textAlign: 'center' }}>
                    <QRCode
                        value={qrUrl}
                        size={200}
                        style={{ marginBottom: 16 }}
                    />
                    <Text copyable>{qrUrl}</Text>
                    <Form.Item label="Format" style={{ marginTop: 16 }}>
                        <Select
                            value={selectedFormat}
                            onChange={setSelectedFormat}
                            style={{ width: 120 }}
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
                        icon={<DownloadOutlined />}
                        onClick={() => {
                            const canvas = document.getElementById('barcode-canvas') as HTMLCanvasElement;
                            if (canvas) {
                                const link = document.createElement('a');
                                link.download = `barkod-${currentBarcode}.png`;
                                link.href = canvas.toDataURL('image/png');
                                link.click();
                                message.success('Barkod indirildi!');
                            }
                        }}
                    >
                        PNG Olarak İndir
                    </Button>
                ]}
                centered
                width={400}
            >
                <div style={{ textAlign: 'center', padding: 24 }}>
                    {/* Barkod görseli */}
                    <Barcode
                        value={currentBarcode || ''}
                        width={2}
                        height={100}
                        fontSize={16}
                        margin={10}
                    />

                    <Text strong style={{ fontSize: 18, display: 'block', margin: '16px 0' }}>
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
        </div>
    );
};

export default MachineScreen;