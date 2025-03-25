import React, {memo, useEffect, useState, useRef} from "react";
import axios from "axios";
import {Link} from "react-router-dom";
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
    Spin,
    Typography,
    Row,
    Col,
    Select,
    DatePicker,
    Switch, Modal, QRCode
} from "antd";
import {
    DownloadOutlined,
    PlusOutlined,
    FilterOutlined,
    TableOutlined,
    UnorderedListOutlined, QrcodeOutlined,
} from "@ant-design/icons";
import {apiUrl} from "../Settings";
import type {ColumnsType} from "antd/es/table";
import moment from "moment";
import {Dayjs} from "dayjs";
import apiClient from "../Utils/ApiClient";

const {Title} = Typography;
const {Option} = Select;

interface MachineRecord {
    id: number;
    name: string;
    code: string;
    location: string;
    manufacturer: string;
    model: string;
    totalFault: number;
    purchaseDate: string;
    isOperational: boolean;
}

interface Filters {
    location: string;
    manufacturer: string;
    isOperational: boolean | null;
    dateRange: [Dayjs | null, Dayjs | null] | null;
}

interface MachineScreenProps {
    onToggleMenu: () => void;
}

const MachineScreen:React.FC<MachineScreenProps> = ({onToggleMenu}) => {
    const [data, setData] = useState<MachineRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
    const [viewMode, setViewMode] = useState<"table" | "card">("table");
    const [qrModalVisible, setQrModalVisible] = useState(false);
    const [qrUrl, setQrUrl] = useState("");
    const [selectedFormat, setSelectedFormat] = useState<string>("png");
    const [filters, setFilters] = useState<Filters>({
        location: "",
        manufacturer: "",
        isOperational: null,
        dateRange: null,
    });
    const qrRef = useRef<any>(null);

    useEffect(() => {
        let isMounted = true; // Component'in mount durumunu takip et

        const fetchData = async () => {
            try {
                const response = await apiClient.get(apiUrl.machine);
                if (isMounted) setData(response.data);
            } catch (error) {
                message.error("Veri yüklenirken bir hata oluştu");
                console.error("Error fetching data:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false; // Component unmount olduğunda istek iptal edilir
        };
    }, []);

    const generateQRCode = (machineId: number) => {
        const link = `https://senindomainin.com/machine-detail/${machineId}`;
        setQrUrl(link);
        setQrModalVisible(true);
    };

    const downloadQRCode = () => {
        // Ant Design QRCode bileşeni için indirme işlemi
        const canvas = document.querySelector('.ant-qrcode canvas') as HTMLCanvasElement;
        if (!canvas) {
            message.error("QR kodu indirilemedi!");
            return;
        }

        try {
            const imageURL = canvas.toDataURL(`image/${selectedFormat}`);
            const link = document.createElement("a");
            link.href = imageURL;
            link.download = `machine-qr-code.${selectedFormat}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            message.success("QR kodu indirildi");
        } catch (error) {
            message.error("QR kodu indirilirken bir hata oluştu");
            console.error("Error downloading QR code:", error);
        }
    };

    const columns: ColumnsType<MachineRecord> = [
        {
            title: "Ad",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
            width: "15%",
        },
        {
            title: "Kod",
            dataIndex: "serialNumber",
            key: "serialNumber",
            width: "10%",
        },
        {
            title: "Konum",
            dataIndex: "location",
            key: "location",
            width: "10%",
        },
        {
            title: "Üretici",
            dataIndex: "manufacturer",
            key: "manufacturer",
            width: "10%",
        },
        {
            title: "Model",
            dataIndex: "model",
            key: "model",
            width: "10%",
        },
        {
            title: "Toplam Arıza",
            dataIndex: "totalFault",
            key: "totalFault",
            sorter: (a, b) => a.totalFault - b.totalFault,
            width: "10%",
        },
        {
            title: "Satın Alma Tarihi",
            dataIndex: "purchaseDate",
            key: "purchaseDate",
            render: (date) => moment(date).format("DD.MM.YYYY"),
            sorter: (a, b) => moment(a.purchaseDate).unix() - moment(b.purchaseDate).unix(),
            width: "15%",
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
            width: "10%",
        },
        {
            title: "İşlemler",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Link to={`/machine-update-machine/${record.id}`}>
                        <Button type="link">Düzenle</Button>
                    </Link>
                    <Button
                        type="primary"
                        icon={<QrcodeOutlined />}
                        onClick={() => generateQRCode(record.id)}
                    >
                        QR Kodu
                    </Button>
                </Space>
            ),
            width: "10%",
        },
    ];

    const handleExportPDF = () => {
        message.success("PDF indirme başladı");
        // PDF export logic here
    };

    const filteredData = data.filter(record => {
        const matchesSearch = Object.values(record).some(value =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        );

        const matchesLocation = !filters.location || record.location === filters.location;
        const matchesManufacturer = !filters.manufacturer || record.manufacturer === filters.manufacturer;
        const matchesOperational = filters.isOperational === null || record.isOperational === filters.isOperational;

        const matchesDateRange = !filters.dateRange || !filters.dateRange[0] || !filters.dateRange[1] ||
            moment(record.purchaseDate).isBetween(filters.dateRange[0]?.toDate() ?? null, filters.dateRange[1]?.toDate() ?? null, 'day', '[]');

        return matchesSearch && matchesLocation && matchesManufacturer &&
            matchesOperational && matchesDateRange;
    });

    return (
        <div>
            <HeaderComponent onToggleMenu={onToggleMenu}/>
            <Card>
                <Row gutter={[16, 16]} justify="space-between" align="middle">
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Title level={4}>Makineler</Title>
                    </Col>

                    <Col xs={24} sm={12} md={16} lg={18}>
                        <Space wrap>
                            <Input.Search
                                placeholder="Arama..."
                                allowClear
                                onSearch={setSearchText}
                                style={{width: 200}}
                            />

                            <Button
                                icon={<FilterOutlined/>}
                                onClick={() => setFilterDrawerVisible(true)}
                            >
                                Filtrele
                            </Button>

                            <Button
                                icon={<DownloadOutlined/>}
                                onClick={handleExportPDF}
                            >
                                PDF İndir
                            </Button>

                            <Link to="/machine-create">
                                <Button type="primary" icon={<PlusOutlined/>}>
                                    Makine Ekle
                                </Button>
                            </Link>
                        </Space>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={filteredData}
                    loading={loading}
                    rowKey="machineId"
                    pagination={{
                        showSizeChanger: true,
                        showTotal: (total) => `Toplam ${total} kayıt`,
                        defaultPageSize: 10,
                        pageSizeOptions: ["10", "50", "100", "200"]
                    }}
                    scroll={{x: true}}
                />

                <Drawer
                    title="Filtreler"
                    placement="right"
                    onClose={() => setFilterDrawerVisible(false)}
                    open={filterDrawerVisible}
                    width={320}
                >
                    <Form layout="vertical">
                        <Form.Item label="Konum">
                            <Select
                                allowClear
                                placeholder="Konum seçin"
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
                                placeholder="Üretici seçin"
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
                                placeholder="Durum seçin"
                                onChange={(value) => setFilters({...filters, isOperational: value})}
                            >
                                <Option value={true}>Aktif</Option>
                                <Option value={false}>Pasif</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item label="Satın Alma Tarihi">
                            <DatePicker.RangePicker
                                onChange={(dates) => setFilters({
                                    ...filters,
                                    dateRange: dates as [Dayjs | null, Dayjs | null] | null
                                })}
                                style={{width: '100%'}}
                            />
                        </Form.Item>
                    </Form>
                </Drawer>
            </Card>
            <Modal
                title="Makine QR Kodu"
                open={qrModalVisible}
                onCancel={() => setQrModalVisible(false)}
                footer={[
                    <Button key="download" type="primary" onClick={downloadQRCode}>
                        QR Kodu İndir
                    </Button>,
                    <Button key="close" onClick={() => setQrModalVisible(false)}>
                        Kapat
                    </Button>,
                ]}
            >
                {qrUrl && (
                    <div style={{ textAlign: "center" }}>
                        <QRCode
                            value={qrUrl}
                            size={200}
                            className="qr-code-element"
                            type={selectedFormat === "png" ? "canvas" : "svg"}
                        />
                        <p>{qrUrl}</p>
                        <Form.Item label="Format">
                            <Select
                                value={selectedFormat}
                                onChange={(value) => setSelectedFormat(value)}
                                style={{ width: 120 }}
                            >
                                <Option value="png">PNG</Option>
                                <Option value="jpeg">JPEG</Option>
                            </Select>
                        </Form.Item>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MachineScreen;