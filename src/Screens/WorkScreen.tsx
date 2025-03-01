import React, { memo, useEffect, useState } from "react";
import axios from "axios";
import HeaderComponent from "../Components/HeaderComponent";
import {
  Table,
  Button,
  Input,
  Space,
  Modal,
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
  Select,
  DatePicker
} from "antd";
import {
  DownloadOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  FilterOutlined,
  TableOutlined,
  UnorderedListOutlined,
  BarcodeOutlined
} from "@ant-design/icons";
import { apiUrl } from "../Settings";
import WorkDetail from "../Components/TableDetailComponent/WorkDetail";
import Barcode from "react-barcode";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";
import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;
const { Option } = Select;

interface WorkRecord {
  workId: number;
  workName: string;
  status: string;
  assignedEmployeeId: string;
  requiredEquipment: string;
  requiredMaterials: string;
  barcode: string;
  priority: string;
  isActive: boolean;
}

interface Filters {
  status: string;
  priority: string;
  isActive: boolean | null;
  assignedEmployee: string;
}

const WorkScreen = memo(() => {
  const [data, setData] = useState<WorkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [filters, setFilters] = useState<Filters>({
    status: "",
    priority: "",
    isActive: null,
    assignedEmployee: ""
  });
  const [barcodeModalVisible, setBarcodeModalVisible] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState("");
  const barcodeRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(apiUrl.work);
      setData(response.data);
    } catch (error) {
      message.error("Veri yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeClick = (barcode: string) => {
    setSelectedBarcode(barcode);
    setBarcodeModalVisible(true);
  };

  const handleBarcodeDownload = async () => {
    if (barcodeRef.current) {
      try {
        const canvas = await html2canvas(barcodeRef.current);
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = url;
        link.download = `barcode-${selectedBarcode}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        message.success("Barkod başarıyla indirildi");
      } catch (error) {
        message.error("Barkod indirilirken bir hata oluştu");
      }
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = columns.map((col) => col.title);
    const tableRows = filteredData.map((row) => [
      row.workName,
      row.status,
      row.assignedEmployeeId,
      row.requiredEquipment,
      row.requiredMaterials,
      row.barcode,
      row.priority,
      row.isActive ? "Aktif" : "Pasif"
    ]);
    
    //@ts-ignore
    doc.autoTable(tableColumn, tableRows);
    doc.save("isler.pdf");
    message.success("PDF başarıyla indirildi");
  };

  const columns: ColumnsType<WorkRecord> = [
    {
      title: "İş Adı",
      dataIndex: "workName",
      key: "workName",
      sorter: (a, b) => a.workName.localeCompare(b.workName),
      width: "15%"
    },
    {
      title: "Durum",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Tamamlandı" ? "green" : status === "Devam Ediyor" ? "blue" : "orange"}>
          {status}
        </Tag>
      ),
      filters: Array.from(new Set(data.map(item => item.status))).map(status => ({
        text: status,
        value: status
      })),
      onFilter: (value, record) => record.status === value,
      width: "10%"
    },
    {
      title: "Öncelik",
      dataIndex: "priority",
      key: "priority",
      render: (priority) => (
        <Tag color={priority === "Yüksek" ? "red" : priority === "Orta" ? "yellow" : "green"}>
          {priority}
        </Tag>
      ),
      width: "10%"
    },
    {
      title: "Çalışan Personel",
      dataIndex: "assignedEmployeeId",
      key: "assignedEmployeeId",
      width: "15%"
    },
    {
      title: "Barkod",
      dataIndex: "barcode",
      key: "barcode",
      render: (barcode) => (
        <Button 
          type="link" 
          icon={<BarcodeOutlined />}
          onClick={() => handleBarcodeClick(barcode)}
        >
          {barcode}
        </Button>
      ),
      width: "15%"
    },
    {
      title: "Durum",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Switch 
          checked={isActive} 
          checkedChildren="Aktif" 
          unCheckedChildren="Pasif"
          disabled
        />
      ),
      width: "10%"
    },
    {
      title: "İşlemler",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => message.info("Detay görüntüleme")}
          >
            Detay
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            href={`work-update-work/${record.workId}`}
          >
            Düzenle
          </Button>
        </Space>
      ),
      width: "15%"
    }
  ];

  const filteredData = data.filter(record => {
    const matchesSearch = Object.values(record).some(value =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    );

    const matchesStatus = !filters.status || record.status === filters.status;
    const matchesPriority = !filters.priority || record.priority === filters.priority;
    const matchesActive = filters.isActive === null || record.isActive === filters.isActive;
    const matchesEmployee = !filters.assignedEmployee || record.assignedEmployeeId === filters.assignedEmployee;

    return matchesSearch && matchesStatus && matchesPriority && matchesActive && matchesEmployee;
  });

  return (
    <div>
      <HeaderComponent />
      
      <Card>
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Title level={4}>İş Kayıtları</Title>
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

              <Button 
                type="primary"
                icon={<PlusOutlined />}
                href="/work-create"
              >
                Yeni İş Ekle
              </Button>
            </Space>
          </Col>
        </Row>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="workId"
            expandable={{
              expandedRowRender: (record) => <WorkDetail id={record.workId} />,
            }}
            pagination={{
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} kayıt`,
              pageSizeOptions: ["10", "20", "50", "100"]
            }}
          />
        </Spin>
      </Card>

      <Modal
        title="Barkod Görüntüleme"
        open={barcodeModalVisible}
        onCancel={() => setBarcodeModalVisible(false)}
        footer={[
          <Button key="download" type="primary" onClick={handleBarcodeDownload}>
            Barkodu İndir
          </Button>,
          <Button key="close" onClick={() => setBarcodeModalVisible(false)}>
            Kapat
          </Button>
        ]}
        centered
        width={400}
      >
        <div
          ref={barcodeRef}
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "20px 0"
          }}
        >
          <Barcode
            value={selectedBarcode}
            width={2}
            height={100}
            displayValue={true}
            font="monospace"
            textAlign="center"
            textPosition="bottom"
            textMargin={2}
            fontSize={20}
            margin={10}
            background="#ffffff"
          />
        </div>
      </Modal>

      <Drawer
        title="Filtreler"
        placement="right"
        onClose={() => setFilterDrawerVisible(false)}
        open={filterDrawerVisible}
        width={320}
      >
        <Form layout="vertical">
          <Form.Item label="Durum">
            <Select
              allowClear
              placeholder="Durum seçin"
              onChange={(value) => setFilters({...filters, status: value})}
            >
              {Array.from(new Set(data.map(item => item.status))).map(status => (
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

          <Form.Item label="Çalışan">
            <Select
              allowClear
              placeholder="Çalışan seçin"
              onChange={(value) => setFilters({...filters, assignedEmployee: value})}
            >
              {Array.from(new Set(data.map(item => item.assignedEmployeeId))).map(employee => (
                <Option key={employee} value={employee}>{employee}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
});

export default WorkScreen;
