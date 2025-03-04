import React, { memo, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import HeaderComponent from "../Components/HeaderComponent";
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
  message,
  Spin,
  Typography,
  Row,
  Col,
  DatePicker
} from "antd";
import {
  UploadOutlined,
  DownloadOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  FilterOutlined,
  TableOutlined,
  UnorderedListOutlined,
  FileExcelOutlined
} from "@ant-design/icons";
import { apiUrl } from "../Settings";
import StoreDetail from "../Components/TableDetailComponent/StoreDetail";
import moment from "moment";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from 'dayjs';
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import apiClient from "../Utils/ApiClient";

dayjs.extend(isBetween);

const { TabPane } = Tabs;
const { Option } = Select;
const { Title } = Typography;

interface StoreData {
  storeId: number;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  supplierInfo: string;
  barcode: string;
  serialNumber: string;
  weight: string;
  dimensions: string;
  lastInventoryDate: string;
}

interface FilterParams {
  unit: string;
  supplier: string;
  dateRange: [Dayjs | null, Dayjs | null] | null;
}

interface StoreScreenProps {
  onToggleMenu: () => void;
}

const StoreScreen: React.FC<StoreScreenProps> = memo(({ onToggleMenu }) => {
  const [data, setData] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<StoreData | null>(null);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [filters, setFilters] = useState<FilterParams>({
    unit: "",
    supplier: "",
    dateRange: null
  });

  const fetchData = async () => {
    setLoading(true);  // Yükleme durumunu true yapıyoruz
    try {
      // apiClient ile veri çekme işlemi
      const response = await apiClient.get(apiUrl.store);  // axios yerine apiClient kullanıldı
      setData(response.data);  // Veriyi state'e aktarıyoruz
    } catch (error) {
      message.error("Veri yüklenirken hata oluştu");  // Hata durumunda mesaj gösteriyoruz
      console.error("Error fetching data:", error);  // Hata detayını konsola yazıyoruz
    } finally {
      setLoading(false);  // Yükleme durumunu false yapıyoruz
    }
  };

  useEffect(() => {
    fetchData();  // Fetch işlemini başlatıyoruz
  }, []);

  const columns: ColumnsType<StoreData> = [
    {
      title: "Adı",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: "15%"
    },
    {
      title: "Stokta",
      dataIndex: "quantity",
      key: "quantity",
      sorter: (a, b) => a.quantity - b.quantity,
      width: "10%"
    },
    {
      title: "Birim",
      dataIndex: "unit",
      key: "unit",
      filters: Array.from(new Set(data.map(item => item.unit))).map(unit => ({
        text: unit,
        value: unit
      })),
      onFilter: (value, record) => record.unit === value,
      width: "10%"
    },
    {
      title: "Birim Fiyatı",
      dataIndex: "unitPrice",
      key: "unitPrice",
      sorter: (a, b) => a.unitPrice - b.unitPrice,
      render: (price) => `₺${price.toFixed(2)}`,
      width: "10%"
    },
    {
      title: "Tedarikçi",
      dataIndex: "supplierInfo",
      key: "supplierInfo",
      width: "15%"
    },
    {
      title: "Son Envanter",
      dataIndex: "lastInventoryDate",
      key: "lastInventoryDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a, b) => dayjs(a.lastInventoryDate).unix() - dayjs(b.lastInventoryDate).unix(),
      width: "15%"
    },
    {
      title: "İşlemler",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedRecord(record);
              setDetailDrawerVisible(true);
            }}
          />
          <Link to={`/store-update-material/${record.storeId}`}>
            <Button icon={<EditOutlined />} type="primary" />
          </Link>
        </Space>
      ),
      width: "15%"
    }
  ];

  const filteredData = data.filter(record => {
    const matchesSearch = Object.values(record).some(value =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    );

    const matchesUnit = !filters.unit || record.unit === filters.unit;
    const matchesSupplier = !filters.supplier || record.supplierInfo.includes(filters.supplier);
    const matchesDateRange = !filters.dateRange || !filters.dateRange[0] || !filters.dateRange[1] ||
      dayjs(record.lastInventoryDate).isBetween(filters.dateRange[0], filters.dateRange[1], 'day', '[]');

    return matchesSearch && matchesUnit && matchesSupplier && matchesDateRange;
  });

  return (
    <div>
      <HeaderComponent onToggleMenu={onToggleMenu} />
      
      <Card>
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Title level={4}>Depo Yönetimi</Title>
          </Col>
          
          <Col xs={24} sm={12} md={16} lg={18}>
            <Space wrap>
              <Input.Search
                placeholder="Arama..."
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 200 }}
              />
              
              <Button 
                icon={<FilterOutlined />}
                onClick={() => setFilterDrawerVisible(true)}
              >
                Filtreler
              </Button>

              <Link to="/material-add">
                <Button type="primary" icon={<PlusOutlined />}>
                  Yeni Ürün
                </Button>
              </Link>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="storeId"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
            defaultPageSize: 10,
            pageSizeOptions: ["10", "20", "50", "100"]
          }}
          scroll={{ x: true }}
          expandable={{
            expandedRowRender: (record) => <StoreDetail id={record.storeId} />,
          }}
        />

        <Modal
          title="Ürünleri İçe Aktar"
          open={importModalVisible}
          onCancel={() => setImportModalVisible(false)}
          footer={null}
        >
          <Tabs defaultActiveKey="1">
            <TabPane tab="Örnek Excel" key="1">
              <Space direction="vertical">
                <Typography.Text>
                  Stok verilerinin nasıl yükleneceğine dair örnek Excel dosyasını indirebilirsiniz.
                </Typography.Text>
                <Button icon={<DownloadOutlined />}>
                  Örnek Excel İndir
                </Button>
              </Space>
            </TabPane>
            <TabPane tab="Yükleme" key="2">
              <Upload.Dragger
                accept=".xlsx,.xls"
                beforeUpload={() => false}
                maxCount={1}
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">Excel dosyanızı sürükleyin veya seçin</p>
              </Upload.Dragger>
            </TabPane>
          </Tabs>
        </Modal>

        <Drawer
          title="Filtreler"
          placement="right"
          onClose={() => setFilterDrawerVisible(false)}
          open={filterDrawerVisible}
          width={320}
        >
          <Form layout="vertical">
            <Form.Item label="Birim">
              <Select
                allowClear
                placeholder="Birim seçin"
                onChange={(value) => setFilters({...filters, unit: value})}
              >
                {Array.from(new Set(data.map(item => item.unit))).map(unit => (
                  <Option key={unit} value={unit}>{unit}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Tedarikçi">
              <Select
                allowClear
                placeholder="Tedarikçi seçin"
                onChange={(value) => setFilters({...filters, supplier: value})}
              >
                {Array.from(new Set(data.map(item => item.supplierInfo))).map(supplier => (
                  <Option key={supplier} value={supplier}>{supplier}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Tarih Aralığı">
              <DatePicker.RangePicker
                onChange={(dates) => setFilters({...filters, dateRange: dates as [Dayjs | null, Dayjs | null] | null})}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Form>
        </Drawer>
      </Card>
    </div>
  );
});

export default StoreScreen;
