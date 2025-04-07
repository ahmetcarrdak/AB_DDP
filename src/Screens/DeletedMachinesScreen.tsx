import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Table,
    Button,
    Card,
    Tag,
    Space,
    Typography,
    Descriptions,
    Divider,
    Modal,
    message,
    Drawer,
    Tooltip,
    Badge,
    Dropdown
} from "antd";
import {
    UndoOutlined,
    EyeOutlined,
    ArrowLeftOutlined,
    ReloadOutlined,
    FilePdfOutlined,
    FileExcelOutlined,
    MoreOutlined
} from "@ant-design/icons";
import apiClient from "../Utils/ApiClient";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";

const { Title, Text } = Typography;

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
    deletedDate: string | null;
}

const DeletedMachinesScreen: React.FC<{ onToggleMenu: () => void }> = ({ onToggleMenu }) => {
    const [data, setData] = useState<MachineRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMachine, setSelectedMachine] = useState<MachineRecord | null>(null);
    const [detailVisible, setDetailVisible] = useState(false);
    const [restoreLoading, setRestoreLoading] = useState(false);
    const [restoreModalVisible, setRestoreModalVisible] = useState(false);
    const navigate = useNavigate();

    const fetchDeletedMachines = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get("/Machine/deleted");
            setData(response.data);
        } catch (error) {
            message.error("Silinmiş makineler yüklenirken hata oluştu");
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeletedMachines();
    }, []);

    const handleRestore = async (id: number) => {
        try {
            setRestoreLoading(true);
            await apiClient.patch(`/Machine/${id}/Restore`);
            message.success("Makine başarıyla geri yüklendi");
            setRestoreModalVisible(false);
            fetchDeletedMachines();
        } catch (error) {
            message.error("Geri yükleme sırasında hata oluştu");
            console.error("Error:", error);
        } finally {
            setRestoreLoading(false);
        }
    };

    const showRestoreConfirm = (id: number) => {
        setSelectedMachine(data.find(m => m.id === id) || null);
        setRestoreModalVisible(true);
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(data.map(item => ({
            'Makine Adı': item.name,
            'Barkod': item.barcode,
            'Seri No': item.serialNumber,
            'Konum': item.location,
            'Üretici': item.manufacturer,
            'Model': item.model,
            'Arıza Sayısı': item.totalFault,
            'Silinme Tarihi': item.deletedDate ? moment(item.deletedDate).format("DD.MM.YYYY HH:mm") : '-'
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Silinmiş Makineler");
        XLSX.writeFile(workbook, "silinmis_makineler.xlsx");
    };

    const exportToPDF = () => {
        const doc = new jsPDF('landscape');
        doc.text("Silinmiş Makineler", 14, 16);

        const tableData = data.map(item => [
            item.name,
            item.barcode,
            item.serialNumber,
            item.location,
            item.deletedDate ? moment(item.deletedDate).format("DD.MM.YYYY HH:mm") : '-'
        ]);

        // @ts-ignore
        doc.autoTable({
            head: [['Makine Adı', 'Barkod', 'Seri No', 'Konum', 'Silinme Tarihi']],
            body: tableData,
            startY: 20,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [22, 160, 133] }
        });

        doc.save("silinmis_makineler.pdf");
    };

    const columns = [
        {
            title: "Makine Adı",
            dataIndex: "name",
            key: "name",
            width: 180,
            fixed: 'left',
            sorter: (a: MachineRecord, b: MachineRecord) => a.name.localeCompare(b.name)
        },
        {
            title: "Barkod",
            dataIndex: "barcode",
            key: "barcode",
            width: 150
        },
        {
            title: "Seri No",
            dataIndex: "serialNumber",
            key: "serialNumber",
            width: 120
        },
        {
            title: "Konum",
            dataIndex: "location",
            key: "location",
            width: 120
        },
        {
            title: "Arıza",
            dataIndex: "totalFault",
            key: "totalFault",
            width: 100,
            render: (count: number) => (
                <Badge
                    count={count}
                    showZero
                    style={{ backgroundColor: count > 0 ? '#ff4d4f' : '#52c41a' }}
                />
            )
        },
        {
            title: "Silinme Tarihi",
            dataIndex: "deletedDate",
            key: "deletedDate",
            width: 150,
            render: (date: string) => date ? moment(date).format("DD.MM.YYYY HH:mm") : '-',
            sorter: (a: MachineRecord, b: MachineRecord) =>
                moment(a.deletedDate || 0).unix() - moment(b.deletedDate || 0).unix()
        },
        {
            title: "İşlemler",
            key: "actions",
            fixed: 'right',
            width: 120,
            render: (_: any, record: MachineRecord) => (
                <Dropdown
                    menu={{
                        items: [
                            {
                                key: 'view',
                                label: 'Detaylar',
                                icon: <EyeOutlined />,
                                onClick: () => {
                                    setSelectedMachine(record);
                                    setDetailVisible(true);
                                }
                            },
                            {
                                key: 'restore',
                                label: 'Geri Yükle',
                                icon: <UndoOutlined />,
                                onClick: () => showRestoreConfirm(record.id)
                            }
                        ]
                    }}
                >
                    <Button icon={<MoreOutlined />} />
                </Dropdown>
            )
        }
    ];

    return (
        <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
            <Card style={{ margin: 16, borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Title level={4} style={{ margin: 0 }}>
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate(-1)}
                            style={{ marginRight: 8 }}
                        />
                        Silinmiş Makineler
                    </Title>
                    <Space>
                        <Tooltip title="Yenile">
                            <Button icon={<ReloadOutlined />} onClick={fetchDeletedMachines} />
                        </Tooltip>
                        <Button icon={<FileExcelOutlined />} onClick={exportToExcel}>
                            Excel
                        </Button>
                        <Button icon={<FilePdfOutlined />} onClick={exportToPDF}>
                            PDF
                        </Button>
                    </Space>
                </div>

                <Text type="secondary">Toplam {data.length} silinmiş makine</Text>

                <Table
                    //@ts-ignore
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    rowKey="id"
                    scroll={{ x: 1000 }}
                    pagination={{
                        showSizeChanger: true,
                        showQuickJumper: true,
                        pageSizeOptions: ["10", "25", "50", "100"],
                        showTotal: (total) => `Toplam ${total} makine`
                    }}
                />
            </Card>

            {/* Makine Detay Drawer */}
            <Drawer
                title={`Makine Detayları: ${selectedMachine?.name || ''}`}
                width={600}
                open={detailVisible}
                onClose={() => setDetailVisible(false)}
                extra={
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => selectedMachine && showRestoreConfirm(selectedMachine.id)}
                            icon={<UndoOutlined />}
                        >
                            Geri Yükle
                        </Button>
                        <Button onClick={() => setDetailVisible(false)}>Kapat</Button>
                    </Space>
                }
            >
                {selectedMachine && (
                    <div>
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Makine Adı">{selectedMachine.name}</Descriptions.Item>
                            <Descriptions.Item label="Barkod">{selectedMachine.barcode}</Descriptions.Item>
                            <Descriptions.Item label="Seri No">{selectedMachine.serialNumber}</Descriptions.Item>
                            <Descriptions.Item label="Konum">{selectedMachine.location}</Descriptions.Item>
                            <Descriptions.Item label="Üretici">{selectedMachine.manufacturer}</Descriptions.Item>
                            <Descriptions.Item label="Model">{selectedMachine.model}</Descriptions.Item>
                            <Descriptions.Item label="Arıza Sayısı">
                                <Badge
                                    count={selectedMachine.totalFault}
                                    showZero
                                    style={{ backgroundColor: selectedMachine.totalFault > 0 ? '#ff4d4f' : '#52c41a' }}
                                />
                            </Descriptions.Item>
                            <Descriptions.Item label="Durum">
                                <Tag color="red">Silinmiş</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Silinme Tarihi">
                                {selectedMachine.deletedDate ? moment(selectedMachine.deletedDate).format("DD.MM.YYYY HH:mm") : '-'}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left">Teknik Bilgiler</Divider>
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Satın Alma Tarihi">
                                {moment(selectedMachine.purchaseDate).format("DD.MM.YYYY")}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Drawer>

            {/* Geri Yükleme Onay Modalı */}
            <Modal
                title="Makineyi Geri Yükle"
                open={restoreModalVisible}
                onCancel={() => setRestoreModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setRestoreModalVisible(false)}>
                        İptal
                    </Button>,
                    <Button
                        key="restore"
                        type="primary"
                        loading={restoreLoading}
                        onClick={() => selectedMachine && handleRestore(selectedMachine.id)}
                        icon={<UndoOutlined />}
                    >
                        Geri Yükle
                    </Button>
                ]}
            >
                <p>
                    <strong>{selectedMachine?.name}</strong> isimli makineyi geri yüklemek istediğinize emin misiniz?
                </p>
                <p>Bu işlem makineyi aktif makine listesine geri ekleyecektir.</p>
            </Modal>
        </div>
    );
};

export default DeletedMachinesScreen;