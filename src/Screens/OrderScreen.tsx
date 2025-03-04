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
  Spin,
  Typography,
  Row,
  Col,
  Select,
  DatePicker,
  Modal,
} from "antd";
import {
  DownloadOutlined,
  PlusOutlined,
  FilterOutlined,
  TableOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { apiUrl } from "../Settings";
import OrderDetail from "../Components/TableDetailComponent/OrderDetail";
import type { ColumnsType } from "antd/es/table";
import moment from "moment";
import { Dayjs } from "dayjs";
import apiClient from "../Utils/ApiClient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Title } = Typography;
const { Option } = Select;

interface OrderRecord {
  orderId: number;
  customerName: string;
  productName: string;
  totalAmount: number;
  orderStatus: string;
  priority: string;
  paymentStatus: string;
  isActive: boolean;
  orderDate: string;
}

interface Filters {
  orderStatus: string;
  priority: string;
  paymentStatus: string;
  isActive: boolean | null;
  dateRange: [Dayjs | null, Dayjs | null] | null;
}

interface OrderScreenProps {
  onToggleMenu: () => void;
}

const OrderScreen: React.FC<OrderScreenProps> = ({ onToggleMenu }) => {
  const [data, setData] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    orderStatus: "",
    priority: "",
    paymentStatus: "",
    isActive: null,
    dateRange: null,
  });
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(apiUrl.order);
        const updatedData = response.data.map((order: any) => ({
          ...order,
          totalAmount: order.quantity * order.unitPrice, // Toplam tutar hesaplama
        }));

        if (isMounted) setData(updatedData);
      } catch (error) {
        console.error("Veri çekme hatası:", error);
        toast.error("Sipariş verileri alınırken hata oluştu!", {
          position: "bottom-right",
          autoClose: 3000,
          theme: "colored",
        });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false; // Unmount sırasında state güncellenmesini önle
    };
  }, []);

  const columns: ColumnsType<OrderRecord> = [
    {
      title: "Sipariş No",
      dataIndex: "orderId",
      key: "orderId",
      sorter: (a, b) => a.orderId - b.orderId,
      width: "10%",
    },
    {
      title: "Müşteri",
      dataIndex: "customerName",
      key: "customerName",
      sorter: (a, b) => a.customerName.localeCompare(b.customerName),
      width: "15%",
    },
    {
      title: "Ürün",
      dataIndex: "productName",
      key: "productName",
      width: "15%",
    },
    {
      title: "Tutar",
      dataIndex: "totalAmount",
      key: "totalAmount",
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      render: (amount) => `₺${amount.toLocaleString()}`,
      width: "10%",
    },
    {
      title: "Durum",
      dataIndex: "orderStatus",
      key: "orderStatus",
      render: (status) => (
        <Tag color={status === "Tamamlandı" ? "green" : status === "Beklemede" ? "orange" : "blue"}>
          {status}
        </Tag>
      ),
      width: "10%",
    },
    {
      title: "Öncelik",
      dataIndex: "priority",
      key: "priority",
      render: (priority) => (
        <Tag color={priority === "Yüksek" ? "red" : priority === "Orta" ? "orange" : "green"}>
          {priority}
        </Tag>
      ),
      width: "10%",
    },
    {
      title: "Ödeme Durumu",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status) => (
        <Tag color={status === "Ödendi" ? "green" : "red"}>
          {status}
        </Tag>
      ),
      width: "10%",
    },
    {
      title: "Durum",
      dataIndex: "isActive",
      key: "isActive",
      render: (active) => (
        <Tag color={active ? "green" : "red"}>
          {active ? "Aktif" : "Pasif"}
        </Tag>
      ),
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
          <Link to={`/order-update-order/${record.orderId}`}>
            <Button type="link">Düzenle</Button>
          </Link>
        </Space>
      ),
      width: "10%",
    },
  ];

  const handleViewDetails = (record: OrderRecord) => {
    Modal.info({
      title: `Sipariş Detayı - #${record.orderId}`,
      width: 800,
      content: <OrderDetail id={record.orderId} />,
    });
  };

  const handleExportPDF = () => {
    message.success("PDF indirme başladı");
    // PDF export logic here
  };

  const filteredData = data.filter(record => {
    const matchesSearch = Object.values(record).some(value =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    );

    const matchesOrderStatus = !filters.orderStatus || record.orderStatus === filters.orderStatus;
    const matchesPriority = !filters.priority || record.priority === filters.priority;
    const matchesPaymentStatus = !filters.paymentStatus || record.paymentStatus === filters.paymentStatus;
    const matchesActive = filters.isActive === null || record.isActive === filters.isActive;
    
    const matchesDateRange = !filters.dateRange || !filters.dateRange[0] || !filters.dateRange[1] || 
      moment(record.orderDate).isBetween(filters.dateRange[0]?.toDate() ?? null, filters.dateRange[1]?.toDate() ?? null, 'day', '[]');

    return matchesSearch && matchesOrderStatus && matchesPriority && 
           matchesPaymentStatus && matchesActive && matchesDateRange;
  });

  return (
    <div>
  
      <ToastContainer />
      <Card>
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Title level={4}>Siparişler</Title>
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

              <Link to="/order-create">
                <Button type="primary" icon={<PlusOutlined />}>
                  Yeni Sipariş
                </Button>
              </Link>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="orderId"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} sipariş`,
          }}
          scroll={{ x: true }}
          expandable={{
            expandedRowRender: (record) => <OrderDetail id={record.orderId} />,
          }}
        />

        <Drawer
          title="Filtreler"
          placement="right"
          onClose={() => setFilterDrawerVisible(false)}
          open={filterDrawerVisible}
          width={320}
        >
          <Form layout="vertical">
            <Form.Item label="Sipariş Durumu">
              <Select
                allowClear
                placeholder="Durum seçin"
                onChange={(value) => setFilters({...filters, orderStatus: value})}
              >
                {Array.from(new Set(data.map(item => item.orderStatus))).map(status => (
                  <Option key={status} value={status}>{status}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Öncelik">
              <Select
                allowClear
                placeholder="Öncelik seçin"
                onChange={(value) => setFilters({...filters, priority: value})}
              >
                {Array.from(new Set(data.map(item => item.priority))).map(priority => (
                  <Option key={priority} value={priority}>{priority}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Ödeme Durumu">
              <Select
                allowClear
                placeholder="Ödeme durumu seçin"
                onChange={(value) => setFilters({...filters, paymentStatus: value})}
              >
                {Array.from(new Set(data.map(item => item.paymentStatus))).map(status => (
                  <Option key={status} value={status}>{status}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Aktiflik Durumu">
              <Select
                allowClear
                placeholder="Aktiflik durumu seçin"
                onChange={(value) => setFilters({...filters, isActive: value})}
              >
                <Option value={true}>Aktif</Option>
                <Option value={false}>Pasif</Option>
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
};

export default OrderScreen;
