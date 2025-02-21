import React, { memo, useEffect, useState } from "react";
import axios from "axios";
import { Table, Spin, Input, Button, Tag, Select } from "antd";
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { AiOutlineFilePdf } from "react-icons/ai";
import {
  MdOutlineArrowBackIosNew,
  MdOutlineArrowForwardIos,
} from "react-icons/md";
import { apiUrl } from "../Settings";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoAddOutline } from "react-icons/io5";

const { Option } = Select;

const MaintenanceRecordScreen = memo(() => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${apiUrl.maintenanceRecord}`);
        setData(response.data);
      } catch (error) {
        console.error("Veri çekme hatası:", error);
        toast.error("Veri alınırken hata oluştu", {
          position: "bottom-right",
          autoClose: 3000,
          theme: "colored",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = data.filter((record) => {
    const matchesQuery = Object.values(record).some((value) =>
      String(value).toLowerCase().includes(query.toLowerCase())
    );

    const matchesType = filterType
      ? record.MaintenanceType === filterType
      : true;

    return matchesQuery && matchesType;
  });

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = [
    { title: "Makine Kodu", dataIndex: "MachineCode", key: "MachineCode" },
    {
      title: "Bakım Türü",
      dataIndex: "MaintenanceType",
      key: "MaintenanceType",
      render: (type: string) => {
        let color =
          type === "Acil" ? "red" : type === "Planlı" ? "blue" : "green";
        return <Tag color={color}>{type}</Tag>;
      },
    },
    { title: "Açıklama", dataIndex: "Description", key: "Description" },
    {
      title: "Bakım Tarihi",
      dataIndex: "MaintenanceDate",
      key: "MaintenanceDate",
      render: (date: string) => new Date(date).toLocaleDateString("tr-TR"),
    },
    { title: "Yapan Kişi", dataIndex: "PerformedBy", key: "PerformedBy" },
    { title: "Notlar", dataIndex: "Notes", key: "Notes" },
  ];

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = columns.map((col) => col.title);
    const tableRows = paginatedData.map((record) => [
      record.MachineCode,
      record.MaintenanceType,
      record.Description,
      new Date(record.MaintenanceDate).toLocaleDateString("tr-TR"),
      record.PerformedBy,
      record.Notes,
    ]);

    //@ts-ignore
    doc.autoTable(tableColumn, tableRows);
    doc.save("bakim_kayitlari.pdf");
  };

  return (
    <div style={{ padding: "20px" }}>
      <ToastContainer />
      <h2>Bakım Kayıtları</h2>

      {/* Arama ve Filtreleme */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <Input
          placeholder="Arama yap..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: "200px" }}
        />
        <Select
          placeholder="Bakım Türü Filtrele"
          onChange={(value) => setFilterType(value)}
          allowClear
          style={{ width: "180px" }}
        >
          <Option value="Planlı">Planlı</Option>
          <Option value="Acil">Acil</Option>
          <Option value="Periyodik">Periyodik</Option>
        </Select>
        <Button type="primary" onClick={exportPDF} icon={<AiOutlineFilePdf />}>
          PDF Olarak İndir
        </Button>
        <Link to={"/maintenance-record-create"}>
          <Button type="primary" onClick={exportPDF} icon={<IoAddOutline />}>
            Ekle
          </Button>
        </Link>
      </div>

      {/* Tablo */}
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={paginatedData}
          rowKey="MaintenanceRecordId"
          pagination={false}
        />
      </Spin>

      {/* Sayfalama */}
      <div style={{ marginTop: "20px", display: "flex", alignItems: "center" }}>
        <Button
          icon={<MdOutlineArrowBackIosNew />}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        />
        <span style={{ margin: "0 15px" }}>
          Sayfa {currentPage} / {Math.ceil(filteredData.length / itemsPerPage)}
        </span>
        <Button
          icon={<MdOutlineArrowForwardIos />}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={currentPage * itemsPerPage >= filteredData.length}
        />
        <Select
          value={itemsPerPage}
          onChange={(value) => setItemsPerPage(value)}
          style={{ marginLeft: "20px", width: "100px" }}
        >
          <Option value={10}>10</Option>
          <Option value={20}>20</Option>
          <Option value={50}>50</Option>
        </Select>
      </div>
    </div>
  );
});

export default MaintenanceRecordScreen;
