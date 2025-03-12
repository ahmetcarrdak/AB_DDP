import React, {memo, useEffect, useState} from "react";
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
    Switch
} from "antd";
import {
    DownloadOutlined,
    PlusOutlined,
    FilterOutlined,
    TableOutlined,
    UnorderedListOutlined,
} from "@ant-design/icons";
import {apiUrl} from "../Settings";
import type {ColumnsType} from "antd/es/table";
import moment from "moment";
import {Dayjs} from "dayjs";
import apiClient from "../Utils/ApiClient";

const {Title} = Typography;
const {Option} = Select;

interface MachineRecord {
    machineId: number;
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

const MachineScreen = memo(() => {
    const [data, setData] = useState<MachineRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
    const [viewMode, setViewMode] = useState<"table" | "card">("table");
    const [filters, setFilters] = useState<Filters>({
        location: "",
        manufacturer: "",
        isOperational: null,
        dateRange: null,
    });

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
            dataIndex: "code",
            key: "code",
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
                    <Link to={`/machine-update-machine/${record.machineId}`}>
                        <Button type="link">Düzenle</Button>
                    </Link>
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
            <HeaderComponent/>
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
        </div>
    );
});

export default MachineScreen;
