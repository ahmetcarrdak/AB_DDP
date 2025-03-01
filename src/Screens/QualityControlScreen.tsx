import React, { memo, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import HeaderComponent from "../Components/HeaderComponent";
import {
  Table,
  Input,
  Button,
  Space,
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Switch,
  message,
  Drawer,
  Form,
  Typography,
  Tag
} from "antd";
import {
  PlusOutlined,
  DownloadOutlined,
  SearchOutlined,
  FilterOutlined,
  SyncOutlined,
  TableOutlined,
  UnorderedListOutlined
} from "@ant-design/icons";
import { apiUrl } from "../Settings";
import moment from "moment";
import type { ColumnsType } from "antd/es/table";
import type { RangePickerProps } from "antd/es/date-picker";
import type { Dayjs } from "dayjs";

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface QualityControlRecord {
  qualityControlRecordId: number;
  productId: string;
  testType: string;
  testResult: string;
  testDate: string;
  testedBy: string;
  comments: string;
}

interface Filters {
  testType: string;
  testResult: string;
  dateRange: [Dayjs | null, Dayjs | null] | null;
  testedBy: string;
}

const QualityControlScreen = memo(() => {
  const [data, setData] = useState<QualityControlRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [filters, setFilters] = useState<Filters>({
    testType: "",
    testResult: "",
    dateRange: null,
    testedBy: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl.qualityControl}`);
      setData(response.data);
    } catch (error) {
      message.error("Veri yüklenirken bir hata oluştu");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<QualityControlRecord> = [
    {
      title: "Ürün No",
      dataIndex: "productId",
      key: "productId",
      sorter: (a, b) => a.productId.localeCompare(b.productId),
      width: "15%"
    },
    {
      title: "Test Türü",
      dataIndex: "testType",
      key: "testType",
      sorter: (a, b) => a.testType.localeCompare(b.testType),
      filters: Array.from(new Set(data.map(item => item.testType))).map(type => ({
        text: type,
        value: type
      })),
      onFilter: (value, record) => record.testType === value,
      width: "15%"
    },
    {
      title: "Test Sonucu",
      dataIndex: "testResult",
      key: "testResult",
      render: (result) => (
        <Tag color={result === "Başarılı" ? "green" : result === "Başarısız" ? "red" : "orange"}>
          {result}
        </Tag>
      ),
      width: "15%"
    },
    {
      title: "Test Tarihi",
      dataIndex: "testDate",
      key: "testDate",
      render: (date) => moment(date).format("DD/MM/YYYY"),
      sorter: (a, b) => moment(a.testDate).unix() - moment(b.testDate).unix(),
      width: "15%"
    },
    {
      title: "Test Eden",
      dataIndex: "testedBy",
      key: "testedBy",
      width: "15%"
    },
    {
      title: "Yorumlar",
      dataIndex: "comments",
      key: "comments",
      ellipsis: true,
      width: "25%"
    }
  ];

  const handleExportPDF = () => {
    message.success("PDF indirme başladı");
    // PDF export logic here
  };

  const filteredData = data.filter(record => {
    const matchesSearch = Object.values(record).some(value =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    );

    const matchesTestType = !filters.testType || record.testType === filters.testType;
    const matchesTestResult = !filters.testResult || record.testResult === filters.testResult;
    const matchesTestedBy = !filters.testedBy || record.testedBy === filters.testedBy;
    
    const matchesDateRange = !filters.dateRange || !filters.dateRange[0] || !filters.dateRange[1] || 
      moment(record.testDate).isBetween(filters.dateRange[0]?.toDate() ?? null, filters.dateRange[1]?.toDate() ?? null, 'day', '[]');

    return matchesSearch && matchesTestType && matchesTestResult && matchesDateRange && matchesTestedBy;
  });

  return (
    <div>
      <HeaderComponent />
      
      <Card>
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Title level={4}>Kalite Kontrol Kayıtları</Title>
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

              <Button 
                icon={<DownloadOutlined />}
                onClick={handleExportPDF}
              >
                PDF İndir
              </Button>

              <Link to="/quality-control-create">
                <Button type="primary" icon={<PlusOutlined />}>
                  Yeni Kayıt
                </Button>
              </Link>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="qualityControlRecordId"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Toplam ${total} kayıt`,
            pageSize: 10,
            pageSizeOptions: ["10", "20", "50", "100"]
          }}
          scroll={{ x: true }}
          size="middle"
        />

        <Drawer
          title="Gelişmiş Filtreler"
          placement="right"
          onClose={() => setFilterDrawerVisible(false)}
          open={filterDrawerVisible}
          width={320}
        >
          <Form layout="vertical">
            <Form.Item label="Test Türü">
              <Select
                allowClear
                placeholder="Test türü seçin"
                onChange={value => setFilters({...filters, testType: value})}
              >
                {Array.from(new Set(data.map(item => item.testType))).map(type => (
                  <Option key={type} value={type}>{type}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Test Sonucu">
              <Select
                allowClear
                placeholder="Test sonucu seçin"
                onChange={value => setFilters({...filters, testResult: value})}
              >
                <Option value="Başarılı">Başarılı</Option>
                <Option value="Başarısız">Başarısız</Option>
                <Option value="Beklemede">Beklemede</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Tarih Aralığı">
              <RangePicker
                style={{ width: "100%" }}
                onChange={(dates) => setFilters({...filters, dateRange: dates})}
              />
            </Form.Item>

            <Form.Item label="Test Eden">
              <Select
                allowClear
                placeholder="Test eden kişiyi seçin"
                onChange={value => setFilters({...filters, testedBy: value})}
              >
                {Array.from(new Set(data.map(item => item.testedBy))).map(person => (
                  <Option key={person} value={person}>{person}</Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Drawer>
      </Card>
    </div>
  );
});

export default QualityControlScreen;
