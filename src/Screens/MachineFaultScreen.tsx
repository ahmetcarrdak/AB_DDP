import React, { memo, useEffect, useState } from "react";
import axios from "axios";
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
    Descriptions,
    Spin
} from "antd";
import {
    DownloadOutlined,
    PlusOutlined,
    FilterOutlined,
} from "@ant-design/icons";
import { apiUrl } from "../Settings";
import type { ColumnsType } from "antd/es/table";
import moment from "moment";
import { Dayjs } from "dayjs";
import apiClient from "../Utils/ApiClient";

const { Title } = Typography;
const { Option } = Select;

interface MachineFaultRecord {
    faultId: number;
    machine: {
        name: string;
        code: string;
    };
    faultStartDate: string;
    faultEndDate: string;
    faultDescription: string;
    cause: string;
    solution: string;
    faultSeverity: string;
    reportedBy: string;
    resolvedBy: string;
    isResolved: boolean;
}

interface Filters {
    severity: string;
    isResolved: boolean | null;
    dateRange: [Dayjs | null, Dayjs | null] | null;
    reportedBy: string;
}

interface MachineScreenProps {
    onToggleMenu: () => void;
}

const MachineFaultScreen: React.FC<MachineScreenProps> = memo(({ onToggleMenu }) => {
    const [data, setData] = useState<MachineFaultRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
    const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<MachineFaultRecord | null>(null);
    const [filters, setFilters] = useState<Filters>({
        severity: "",
        isResolved: null,
        dateRange: null,
        reportedBy: ""
    });

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(apiUrl.machineFault);
                if (isMounted) setData(response.data);
            } catch (error) {
                console.error("Error fetching data:", error);
                message.error("Veri yüklenirken bir hata oluştu");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    const columns: ColumnsType<MachineFaultRecord> = [
        {
            title: "Makine Adı",
            dataIndex: ["machine", "name"],
            key: "machineName",
            width: "10%",
        },
        {
            title: "Makine Kodu",
            dataIndex: ["machine", "code"],
            key: "machineCode",
            width: "10%",
        },
        {
            title: "Arıza Başlangıç",
            dataIndex: "faultStartDate",
            key: "faultStartDate",
            render: (date) => moment(date).format("DD/MM/YYYY"),
            width: "10%",
        },
        {
            title: "Arıza Bitiş",
            dataIndex: "faultEndDate",
            key: "faultEndDate",
            render: (date) => moment(date).format("DD/MM/YYYY"),
            width: "10%",
        },
        {
            title: "Şiddet",
            dataIndex: "faultSeverity",
            key: "faultSeverity",
            render: (severity) => (
                <Tag color={severity === "Yüksek" ? "red" : severity === "Orta" ? "orange" : "green"}>
                    {severity}
                </Tag>
            ),
            width: "8%",
        },
        {
            title: "Durum",
            dataIndex: "isResolved",
            key: "isResolved",
            render: (resolved) => (
                <Tag color={resolved ? "green" : "red"}>
                    {resolved ? "Çözüldü" : "Beklemede"}
                </Tag>
            ),
            width: "8%",
        },
        {
            title: "Bildiren",
            dataIndex: "reportedBy",
            key: "reportedBy",
            width: "10%",
        },
        {
            title: "İşlemler",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button type="link" onClick={() => handleViewDetails(record)}>
                        Detay
                    </Button>
                </Space>
            ),
            width: "10%",
        },
    ];

    const handleViewDetails = (record: MachineFaultRecord) => {
        setSelectedRecord(record);
        setDetailDrawerVisible(true);
    };

    const handleCloseDetailDrawer = () => {
        setDetailDrawerVisible(false);
        setSelectedRecord(null);
    };

    const handleExportPDF = () => {
        message.success("PDF indirme başladı");
        // PDF export logic here
    };

    const filteredData = data.filter(record => {
        const matchesSearch = Object.values(record).some(value =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        );

        const matchesSeverity = !filters.severity || record.faultSeverity === filters.severity;
        const matchesResolved = filters.isResolved === null || record.isResolved === filters.isResolved;
        const matchesReportedBy = !filters.reportedBy || record.reportedBy === filters.reportedBy;

        const matchesDateRange = !filters.dateRange || !filters.dateRange[0] || !filters.dateRange[1] ||
            moment(record.faultStartDate).isBetween(filters.dateRange[0]?.toDate() ?? null, filters.dateRange[1]?.toDate() ?? null, 'day', '[]');

        return matchesSearch && matchesSeverity && matchesResolved &&
            matchesReportedBy && matchesDateRange;
    });

    return (
        <div>
            <HeaderComponent onToggleMenu={onToggleMenu} />
            <Card>
                <Row gutter={[16, 16]} justify="space-between" align="middle">
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Title level={4}>Makine Arızaları</Title>
                    </Col>

                    <Col xs={24} sm={12} md={16} lg={18}>
                        <Space wrap>
                            <Input.Search
                                placeholder="Arama..."
                                allowClear
                                onSearch={setSearchText}
                                style={{ width: 200 }}
                            />

                            <Button
                                icon={<FilterOutlined />}
                                onClick={() => setFilterDrawerVisible(true)}
                            >
                                Filtrele
                            </Button>

                            <Button
                                icon={<DownloadOutlined />}
                                onClick={handleExportPDF}
                            >
                                PDF İndir
                            </Button>

                            <Link to="/machine-fault-create">
                                <Button type="primary" icon={<PlusOutlined />}>
                                    Yeni Arıza Ekle
                                </Button>
                            </Link>
                        </Space>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="faultId"
                    loading={loading}
                    pagination={{
                        total: filteredData.length,
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true
                    }}
                    scroll={{ x: 1000 }}
                />

                {/* Filtre Drawer */}
                <Drawer
                    title="Filtreler"
                    placement="right"
                    onClose={() => setFilterDrawerVisible(false)}
                    open={filterDrawerVisible}
                    width={320}
                >
                    <Form layout="vertical">
                        <Form.Item label="Şiddet">
                            <Select
                                allowClear
                                placeholder="Şiddet seçin"
                                onChange={(value) => setFilters({ ...filters, severity: value })}
                            >
                                <Option value="Yüksek">Yüksek</Option>
                                <Option value="Orta">Orta</Option>
                                <Option value="Düşük">Düşük</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item label="Durum">
                            <Select
                                allowClear
                                placeholder="Durum seçin"
                                onChange={(value) => setFilters({ ...filters, isResolved: value })}
                            >
                                <Option value={true}>Çözüldü</Option>
                                <Option value={false}>Beklemede</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item label="Bildiren">
                            <Select
                                allowClear
                                placeholder="Bildiren kişiyi seçin"
                                onChange={(value) => setFilters({ ...filters, reportedBy: value })}
                            >
                                {Array.from(new Set(data.map(item => item.reportedBy))).map(person => (
                                    <Option key={person} value={person}>{person}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item label="Tarih Aralığı">
                            <DatePicker.RangePicker
                                onChange={(dates) => setFilters({
                                    ...filters,
                                    dateRange: dates as [Dayjs | null, Dayjs | null] | null
                                })}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Form>
                </Drawer>

                {/* Detay Drawer */}
                <Drawer
                    title="Arıza Detayları"
                    placement="right"
                    onClose={handleCloseDetailDrawer}
                    open={detailDrawerVisible}
                    width={600}
                >
                    {selectedRecord && (
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Makine Adı">{selectedRecord.machine.name}</Descriptions.Item>
                            <Descriptions.Item label="Makine Kodu">{selectedRecord.machine.code}</Descriptions.Item>
                            <Descriptions.Item label="Arıza Başlangıç Tarihi">
                                {moment(selectedRecord.faultStartDate).format("DD/MM/YYYY")}
                            </Descriptions.Item>
                            <Descriptions.Item label="Arıza Bitiş Tarihi">
                                {moment(selectedRecord.faultEndDate).format("DD/MM/YYYY")}
                            </Descriptions.Item>
                            <Descriptions.Item label="Şiddet">
                                <Tag color={selectedRecord.faultSeverity === "Yüksek" ? "red" : selectedRecord.faultSeverity === "Orta" ? "orange" : "green"}>
                                    {selectedRecord.faultSeverity}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Durum">
                                <Tag color={selectedRecord.isResolved ? "green" : "red"}>
                                    {selectedRecord.isResolved ? "Çözüldü" : "Beklemede"}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Açıklama">{selectedRecord.faultDescription}</Descriptions.Item>
                            <Descriptions.Item label="Sebep">{selectedRecord.cause}</Descriptions.Item>
                            <Descriptions.Item label="Çözüm">{selectedRecord.solution}</Descriptions.Item>
                            <Descriptions.Item label="Bildiren">{selectedRecord.reportedBy}</Descriptions.Item>
                            <Descriptions.Item label="Çözen">{selectedRecord.resolvedBy}</Descriptions.Item>
                        </Descriptions>
                    )}
                </Drawer>
            </Card>
        </div>
    );
});

export default MachineFaultScreen;