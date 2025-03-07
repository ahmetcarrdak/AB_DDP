import React, {memo, useCallback, useEffect, useState} from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import HeaderComponent from "../Components/HeaderComponent";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    Table,
    Button,
    Input,
    Space,
    Modal,
    Upload,
    Tabs,
    Select,
    Card,
    Tag,
    Switch,
    Drawer,
    Form,
    Typography,
    Row,
    Col,
    Checkbox,
} from "antd";
import {
    UploadOutlined,
    DownloadOutlined,
    UserAddOutlined,
    EditOutlined,
    SaveOutlined,
    CloseOutlined,
    SearchOutlined,
    FilterOutlined,
    EyeOutlined,
} from "@ant-design/icons";
import { apiUrl } from "../Settings";
import PersonDetail from "../Components/TableDetailComponent/PersonDetail";
import * as XLSX from 'xlsx';
import type { ColumnsType } from 'antd/es/table';
import apiClient from "../Utils/ApiClient";
import personDetail from "../Components/TableDetailComponent/PersonDetail";

const { TabPane } = Tabs;
const { Option } = Select;
const { Title } = Typography;

interface PersonData {
    id: number;
    firstName: string;
    lastName: string;
    identityNumber: string;
    birthDate: string;
    address: string;
    phoneNumber: string;
    email: string;
    hireDate: string;
    department: string;
    positionId: number;
    positionName: string;
    salary: number;
    isActive: boolean;
    bloodType: string;
    emergencyContact: string;
    emergencyPhone: string;
    educationLevel: string;
    driverLicenseType: string;
    notes: string;
    vacationDays: number;
    hasHealthInsurance: boolean;
    lastHealthCheck: string;
}

interface UpdatePersonData {
    id: number;
    firstName: string;
    lastName: string;
    department: string;
    positionId: number;
    phoneNumber: string;
    email: string;
    isActive: boolean;
}

interface PersonScreenProps {
    onToggleMenu: () => void;
}

const PersonScreen: React.FC<PersonScreenProps> = ({ onToggleMenu }) => {
    const [data, setData] = useState<PersonData[]>([]);
    const [filteredData, setFilteredData] = useState<PersonData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState<{[key: string]: PersonData}>({});
    const [positions, setPositions] = useState<any[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<PersonData | null>(null);
    const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
    const [importModalVisible, setImportModalVisible] = useState(false);
    const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
    const [tableView, setTableView] = useState<'default' | 'compact' | 'card'>('default');
    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState({
        department: '',
        position: '',
        status: ''
    });
    const [importFile, setImportFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [columnFilters, setColumnFilters] = useState({
        name: [] as string[],
        department: [] as string[],
        position: [] as string[],
        contact: [] as string[]
    });
    const [uploading, setUploading] = useState(false);


    useEffect(() => {
        filterData();
    }, [data, searchText, filters, columnFilters]);

    const fetchData = useCallback(async () => {
        let isMounted = true;
        setLoading(true);

        try {
            // API talepleri paralel olarak yapılır
            const [personResponse, positionResponse] = await Promise.all([
                apiClient.get(apiUrl.person),  // apiClient kullanıldı
                apiClient.get(apiUrl.positions), // apiClient kullanıldı
            ]);

            if (!isMounted) return;

            // Geçersiz veri kontrolü
            if (!personResponse.data || !positionResponse.data) {
                throw new Error("Invalid response data");
            }

            // Personel verilerine pozisyon adını ekle
            const processedData = personResponse.data.map((person: any) => ({
                ...person,
                positionName:
                    positionResponse.data.find((p: any) => p.positionId === person.positionId)
                        ?.positionName || "Unknown", // Pozisyon ismi bulunamazsa "Unknown" olarak ayarla
            }));

            // Verileri state'e set et
            setData(processedData);
            setFilteredData(processedData);
            setPositions(positionResponse.data);
        } catch (error) {
            console.error("Veri çekme hatası:", error);
            toast.error("Veri yüklenirken hata oluştu");
            setData([]);
            setFilteredData([]);
            setPositions([]);
        } finally {
            setLoading(false);
        }

        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, []);

// useEffect ile veri çekme işlemi
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveAll = async () => {
        try {
            setLoading(true);

            // Eğer değişiklik yapılmadıysa kullanıcıyı uyar
            if (Object.keys(editedData).length === 0) {
                toast.warning("Değişiklik yapılmadı");
                return;
            }

            // Güncelleme verilerini hazırlama
            const updates = Object.values(editedData).map((person) => ({
                id: person.id,
                firstName: person.firstName || "",
                lastName: person.lastName || "",
                department: person.department || "",
                positionId: person.positionId || 0,
                phoneNumber: person.phoneNumber || "",
                email: person.email || "",
                isActive: typeof person.isActive === "boolean" ? person.isActive : true, // Aktiflik kontrolü
            }));

            // Eğer güncellenmesi gereken veri yoksa uyarı göster
            if (updates.length === 0) {
                toast.warning("Güncellenecek veri bulunamadı");
                return;
            }

            console.log("Updates being sent:", updates);

            // Güncellemeleri API'ye gönder
            await apiClient.post(apiUrl.personCollectiveUpdate, updates);  // apiClient kullanıldı

            // Başarılı işlem mesajı
            toast.success("Güncellemeler başarıyla kaydedildi");
            setIsEditing(false);
            setEditedData({}); // Düzenlenen veriyi sıfırla

            // Veri yenileme işlemi
            await fetchData();
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Güncellemeler kaydedilirken hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (record: PersonData, field: string, value: any) => {
        const newData = { ...editedData };
        if (!newData[record.id]) {
            newData[record.id] = { ...record };
        }
        newData[record.id] = { ...newData[record.id], [field]: value };
        setEditedData(newData);
        console.log('Current edited data:', newData); // Debug log
    };

    const filterData = () => {
        let filtered = [...data];

        // Search filter
        if (searchText) {
            filtered = filtered.filter(item =>
                Object.values(item).some(val =>
                    String(val).toLowerCase().includes(searchText.toLowerCase())
                )
            );
        }

        // Department filter
        if (filters.department) {
            filtered = filtered.filter(item => item.department === filters.department);
        }

        // Position filter
        if (filters.position) {
            filtered = filtered.filter(item => item.positionId === Number(filters.position));
        }

        // Status filter
        if (filters.status) {
            filtered = filtered.filter(item =>
                (filters.status === 'active' && item.isActive) ||
                (filters.status === 'inactive' && !item.isActive)
            );
        }

        // Column filters
        if (columnFilters.name.length > 0) {
            filtered = filtered.filter(item =>
                columnFilters.name.some(name =>
                    `${item.firstName} ${item.lastName}`.toLowerCase().includes(name.toLowerCase())
                )
            );
        }
        if (columnFilters.department.length > 0) {
            filtered = filtered.filter(item =>
                columnFilters.department.includes(item.department)
            );
        }
        if (columnFilters.position.length > 0) {
            filtered = filtered.filter(item =>
                columnFilters.position.includes(item.positionName)
            );
        }
        if (columnFilters.contact.length > 0) {
            filtered = filtered.filter(item =>
                columnFilters.contact.some(contact =>
                    item.phoneNumber.includes(contact) ||
                    item.email.toLowerCase().includes(contact.toLowerCase())
                )
            );
        }

        setFilteredData(filtered);
    };

    const columns: ColumnsType<PersonData> = [
        {
            title: 'Name',
            dataIndex: 'firstName',
            key: 'firstName',
            sorter: (a, b) => a.firstName.localeCompare(b.firstName),
            render: (_, record) => isEditing ? (
                <Space>
                    <Input 
                        defaultValue={record.firstName}
                        onChange={e => handleEdit(record, 'firstName', e.target.value)}
                    />
                    <Input 
                        defaultValue={record.lastName}
                        onChange={e => handleEdit(record, 'lastName', e.target.value)}
                    />
                </Space>
            ) : `${record.firstName} ${record.lastName}`,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {Array.from(new Set(data.map(item => `${item.firstName} ${item.lastName}`))).map(name => (
                            <Checkbox
                                key={name}
                                checked={columnFilters.name.includes(name)}
                                onChange={(e) => {
                                    const newValues = e.target.checked
                                        ? [...columnFilters.name, name]
                                        : columnFilters.name.filter(n => n !== name);
                                    setColumnFilters({ ...columnFilters, name: newValues });
                                    setSelectedKeys(newValues as React.Key[]);
                                    confirm();
                                }}
                            >
                                {name}
                            </Checkbox>
                        ))}
                        <Button
                            onClick={() => {
                                clearFilters?.();
                                setColumnFilters({ ...columnFilters, name: [] });
                            }}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Reset
                        </Button>
                    </Space>
                </div>
            ),
            filterIcon: filtered => <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        },
        {
            title: 'Department',
            dataIndex: 'department',
            key: 'department',
            sorter: (a, b) => a.department.localeCompare(b.department),
            render: (text, record) => isEditing ? (
                <Select
                    defaultValue={text}
                    style={{ width: '100%' }}
                    onChange={value => handleEdit(record, 'department', value)}
                >
                    {Array.from(new Set(data.map(item => item.department))).map(dept => (
                        <Option key={dept} value={dept}>{dept}</Option>
                    ))}
                </Select>
            ) : text,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {Array.from(new Set(data.map(item => item.department))).map(dept => (
                            <Checkbox
                                key={dept}
                                checked={columnFilters.department.includes(dept)}
                                onChange={(e) => {
                                    const newValues = e.target.checked
                                        ? [...columnFilters.department, dept]
                                        : columnFilters.department.filter(d => d !== dept);
                                    setColumnFilters({ ...columnFilters, department: newValues });
                                    setSelectedKeys(newValues as React.Key[]);
                                    confirm();
                                }}
                            >
                                {dept}
                            </Checkbox>
                        ))}
                        <Button
                            onClick={() => {
                                clearFilters?.();
                                setColumnFilters({ ...columnFilters, department: [] });
                            }}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Reset
                        </Button>
                    </Space>
                </div>
            ),
            filterIcon: filtered => <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        },
        {
            title: 'Position',
            dataIndex: 'positionName',
            key: 'positionName',
            sorter: (a, b) => a.positionName.localeCompare(b.positionName),
            render: (text, record) => isEditing ? (
                <Select
                    defaultValue={record.positionId}
                    style={{ width: '100%' }}
                    onChange={value => handleEdit(record, 'positionId', value)}
                >
                    {positions.map(pos => (
                        <Option key={pos.positionId} value={pos.positionId}>
                            {pos.positionName}
                        </Option>
                    ))}
                </Select>
            ) : text,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {Array.from(new Set(data.map(item => item.positionName))).map(pos => (
                            <Checkbox
                                key={pos}
                                checked={columnFilters.position.includes(pos)}
                                onChange={(e) => {
                                    const newValues = e.target.checked
                                        ? [...columnFilters.position, pos]
                                        : columnFilters.position.filter(p => p !== pos);
                                    setColumnFilters({ ...columnFilters, position: newValues });
                                    setSelectedKeys(newValues as React.Key[]);
                                    confirm();
                                }}
                            >
                                {pos}
                            </Checkbox>
                        ))}
                        <Button
                            onClick={() => {
                                clearFilters?.();
                                setColumnFilters({ ...columnFilters, position: [] });
                            }}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Reset
                        </Button>
                    </Space>
                </div>
            ),
            filterIcon: filtered => <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        },
        {
            title: 'Contact',
            dataIndex: 'contact',
            key: 'contact',
            render: (_, record) => isEditing ? (
                <Space direction="vertical" size="small">
                    <Input
                        defaultValue={record.phoneNumber}
                        onChange={e => handleEdit(record, 'phoneNumber', e.target.value)}
                    />
                    <Input
                        defaultValue={record.email}
                        onChange={e => handleEdit(record, 'email', e.target.value)}
                    />
                </Space>
            ) : (
                <Space direction="vertical" size="small">
                    <div>{record.phoneNumber}</div>
                    <div>{record.email}</div>
                </Space>
            ),
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {Array.from(new Set([
                            ...data.map(item => item.phoneNumber),
                            ...data.map(item => item.email)
                        ])).map(contact => (
                            <Checkbox
                                key={contact}
                                checked={columnFilters.contact.includes(contact)}
                                onChange={(e) => {
                                    const newValues = e.target.checked
                                        ? [...columnFilters.contact, contact]
                                        : columnFilters.contact.filter(c => c !== contact);
                                    setColumnFilters({ ...columnFilters, contact: newValues });
                                    setSelectedKeys(newValues as React.Key[]);
                                    confirm();
                                }}
                            >
                                {contact}
                            </Checkbox>
                        ))}
                        <Button
                            onClick={() => {
                                clearFilters?.();
                                setColumnFilters({ ...columnFilters, contact: [] });
                            }}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Reset
                        </Button>
                    </Space>
                </div>
            ),
            filterIcon: filtered => <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive, record) => isEditing ? (
                <Switch
                    defaultChecked={isActive}
                    onChange={checked => handleEdit(record, 'isActive', checked)}
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                />
            ) : (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Active' : 'Inactive'}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => {
                            setSelectedRecord(record);
                            setDetailDrawerVisible(true);
                        }}
                    />
                    <Link to={`/person-update-user/${record.id}`}>
                        <Button icon={<EditOutlined />} type="primary" />
                    </Link>
                </Space>
            )
        }
    ];

    const handleExport = () => {
        const excel = XLSX.utils.json_to_sheet(filteredData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, excel, 'Personnel');
        XLSX.writeFile(wb, 'personnel_data.xlsx');
    };

    const beforeUpload = (file: File) => {
        const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                       file.type === 'application/vnd.ms-excel';
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isExcel) {
            toast.error('Sadece Excel dosyaları yükleyebilirsiniz!');
            return false;
        }

        if (!isLt2M) {
            toast.error('Dosya boyutu 2MB\'dan küçük olmalıdır!');
            return false;
        }

        // Read and preview file data
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const wb = XLSX.read(e.target?.result, { type: 'binary' });
                const sheet = wb.Sheets[wb.SheetNames[0]];
                const data = XLSX.utils.sheet_to_json(sheet);
                setPreviewData(data.slice(0, 5)); // Get first 5 rows
                setImportFile(file);
            } catch (error) {
                toast.error('Excel dosyası okunurken bir hata oluştu!');
            }
        };
        reader.readAsBinaryString(file);

        return false;
    };

    return (
        <div>
            <HeaderComponent onToggleMenu={onToggleMenu} />
            <ToastContainer position="top-right" autoClose={3000} />

            <Card>
                <Row gutter={[16, 16]} align="middle" justify="space-between">
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Input
                            placeholder="Search..."
                            prefix={<SearchOutlined />}
                            onChange={e => setSearchText(e.target.value)}
                            allowClear
                        />
                    </Col>

                    <Col xs={24} sm={12} md={16} lg={18}>
                        <Space wrap>
                            <Button
                                icon={<FilterOutlined />}
                                onClick={() => setFilterDrawerVisible(true)}
                            >
                                Filtrele
                            </Button>

                            <Select
                                defaultValue="default"
                                onChange={(value: 'default' | 'compact' | 'card') => setTableView(value)}
                                style={{ width: 120 }}
                            >
                                <Option value="default">Varsayılan Görünüm</Option>
                                <Option value="compact">Sıkıştırılmış Görünüm</Option>
                                <Option value="card">Kart Görünüm</Option>
                            </Select>

                            <Button
                                icon={<DownloadOutlined />}
                                onClick={handleExport}
                            >
                                Dışa Aktar
                            </Button>

                            {isEditing ? (
                                <>
                                    <Button
                                        type="primary"
                                        icon={<SaveOutlined />}
                                        onClick={handleSaveAll}
                                        loading={loading}
                                    >
                                        Hepsini Kaydet
                                    </Button>
                                    <Button
                                        icon={<CloseOutlined />}
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditedData({});
                                        }}
                                    >
                                        İptal
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    type="primary"
                                    icon={<EditOutlined />}
                                    onClick={() => setIsEditing(true)}
                                >
                                    Toplu Düzenleme
                                </Button>
                            )}

                            <Link to="/person-create">
                                <Button
                                    type="primary"
                                    icon={<UserAddOutlined />}
                                >
                                    Personel Ekle
                                </Button>
                            </Link>
                        </Space>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={filteredData}
                    loading={loading}
                    size={tableView === 'compact' ? 'small' : 'middle'}
                    pagination={{
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Total ${total} items`
                    }}
                    scroll={{ x: 'max-content' }}
                    style={{ marginTop: 20 }}
                />
            </Card>

            {/* Filter Drawer */}
            <Drawer
                title="Filters"
                placement="right"
                onClose={() => setFilterDrawerVisible(false)}
                visible={filterDrawerVisible}
                width={300}
            >
                <Form layout="vertical">
                    <Form.Item label="Department">
                        <Select
                            value={filters.department}
                            onChange={value => setFilters({ ...filters, department: value })}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            {Array.from(new Set(data.map(item => item.department))).map(dept => (
                                <Option key={dept} value={dept}>{dept}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Position">
                        <Select
                            value={filters.position}
                            onChange={value => setFilters({ ...filters, position: value })}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            {positions.map(pos => (
                                <Option key={pos.positionId} value={pos.positionId}>
                                    {pos.positionName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Status">
                        <Select
                            value={filters.status}
                            onChange={value => setFilters({ ...filters, status: value })}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Drawer>

            {/* Detail Drawer */}
            <Drawer
                title="Person Details"
                placement="right"
                onClose={() => setDetailDrawerVisible(false)}
                visible={detailDrawerVisible}
                width={600}
            >
                {selectedRecord && (
                    // @ts-ignore
                    <PersonDetail id={selectedRecord.id} />
                )}
            </Drawer>

            {/* Import Modal */}
            <Modal
                title="Import Personnel Data"
                visible={importModalVisible}
                onCancel={() => setImportModalVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setImportModalVisible(false)}>
                        Cancel
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={uploading}
                        onClick={() => {/* Handle import */}}
                    >
                        Import
                    </Button>
                ]}
            >
                <Upload.Dragger
                    name="file"
                    beforeUpload={beforeUpload}
                    accept=".xlsx,.xls"
                    showUploadList={false}
                >
                    <p className="ant-upload-drag-icon">
                        <UploadOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                </Upload.Dragger>

                {previewData.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                        <h4>Preview:</h4>
                        <Table
                            dataSource={previewData}
                            columns={Object.keys(previewData[0]).map(key => ({
                                title: key,
                                dataIndex: key,
                                key: key
                            }))}
                            size="small"
                            pagination={false}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PersonScreen;