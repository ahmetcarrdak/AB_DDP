import React, { memo, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import HeaderComponent from "../Components/HeaderComponent";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Spin } from "antd";
import {
  MdOutlineArrowBackIosNew,
  MdOutlineArrowForwardIos,
} from "react-icons/md";
import { apiUrl } from "../Settings";
import StoreDetail from "../Components/TableDetailComponent/StoreDetail";
import { BsDatabaseFill, BsDatabaseFillAdd } from "react-icons/bs";
import { AiFillFileAdd, AiOutlineFilePdf } from "react-icons/ai";

// Veriyi sayfalama işlemi
const paginateData = (
  data: any[],
  currentPage: number,
  itemsPerPage: number
) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  return data.slice(startIndex, startIndex + itemsPerPage);
};

// Veriyi sıralama işlemi
const sortData = (data: any[], column: string, ascending: boolean) => {
  return data.sort((a, b) => {
    if (a[column] < b[column]) return ascending ? -1 : 1;
    if (a[column] > b[column]) return ascending ? 1 : -1;
    return 0;
  });
};

// Veriyi filtreleme işlemi
const filterData = (data: any[], query: string) => {
  if (!query) return data;
  return data.filter((row) => {
    return Object.values(row).some((value) =>
      String(value).toLowerCase().includes(query.toLowerCase())
    );
  });
};

const StoreScreen = memo(() => {
  const [data, setData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [query, setQuery] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [sortAscending, setSortAscending] = useState(true);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [loadingTable, setLoadingTable] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingTable(true);
      try {
        const response = await axios.get(apiUrl.store);
        setData(response.data);
      } catch (error) {
        console.error("Verileri çekerken bir hata oluştu:", error);
      } finally {
        setLoadingTable(false); // Yükleme tamamlandıktan sonra spin durduruluyor
      }
    };

    fetchData();
  }, []);

  const columns = [
    { title: "Adı", data: "name" },
    { title: "Stokta", data: "quantity" },
    { title: "Birim", data: "unit" },
    { title: "Birim Fiyatı", data: "unitPrice" },
    { title: "Tedarikçi Bilgisi", data: "supplierInfo" },
    { title: "Barkod", data: "barcode" },
    { title: "Seri Numarası", data: "serialNumber" },
    { title: "Ağırlık", data: "weight" },
    { title: "Boyutlar", data: "dimensions" },
    { title: "Son Envanter Tarihi", data: "lastInventoryDate" },
  ];

  const filteredData = filterData(data, query);
  const sortedData = sortColumn
    ? sortData(filteredData, sortColumn, sortAscending)
    : filteredData;
  const paginatedData = paginateData(sortedData, currentPage, itemsPerPage);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortAscending(!sortAscending);
    } else {
      setSortColumn(column);
      setSortAscending(true);
    }
  };

  const toggleRow = (storeId: number) => {
    setExpandedRow(expandedRow === storeId ? null : storeId); // Satır detaylarını aç/kapat
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const tableColumn = columns.map((col) => col.title);
    const tableRows = paginatedData.map((row) =>
      columns.map((col) => row[col.data])
    );
    //@ts-ignore
    doc.autoTable(tableColumn, tableRows);
    doc.save("tablo.pdf");
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <HeaderComponent />
      </div>
      <Spin spinning={loadingTable} tip="Depo verileri yükleniyor...">
        <div className="screen-body">
          <input
            type="text"
            placeholder="Arama..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={"table-seach-input"}
          />
          <div className={"table-head"}>
            <label htmlFor="itemsPerPage"></label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className={"table-count-row"}
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
            <button onClick={downloadPDF} className={"table-action-button"}>
              <AiOutlineFilePdf />
              <span style={{ paddingLeft: 10 }}>PDF Olarak İndir</span>
            </button>
            <Link to={"/material-add"} className="table-action-button">
              <BsDatabaseFill />
              <span style={{ paddingLeft: 10 }}>Malzeme ekle</span>
            </Link>
            <button className="table-action-button">
              <AiFillFileAdd />
              <span style={{ paddingLeft: 10 }}> Malzemeleri içe aktar</span>
            </button>
            <Link to={"/work-create"} className="table-action-button">
              <BsDatabaseFillAdd />
              <span style={{ paddingLeft: 10 }}>
                Yeni malzeme talebi oluştur
              </span>
            </Link>
          </div>

          <table className="table">
            <thead className={"table-thead"}>
              <tr>
                <th>#</th>
                {columns.map((col) => (
                  <th
                    key={col.data}
                    onClick={() => handleSort(col.data)}
                    className={"table-thead-th"}
                  >
                    {col.title}{" "}
                    {sortColumn === col.data && (sortAscending ? "↑" : "↓")}
                  </th>
                ))}
                <th>#</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 &&
                paginatedData.map((row, index) => (
                  <React.Fragment key={row.storeId}>
                    <tr
                      onClick={() => toggleRow(row.storeId)}
                      className={"table-tbody"}
                    >
                      {/* Satır numarası dinamik olarak hesaplanıyor */}
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      {columns.map((col) => (
                        <td key={col.data} className="table-tbody-td">
                          {col.data === "lastInventoryDate"
                            ? new Intl.DateTimeFormat("tr-TR", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              }).format(new Date(row[col.data]))
                            : row[col.data]}
                        </td>
                      ))}
                      <td>
                        <a
                          href={`store-update-material/${row.storeId}`}
                          className="edit-row-button"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          Düzenle
                        </a>
                      </td>
                    </tr>

                    {expandedRow === row.storeId && (
                      <tr>
                        <td colSpan={columns.length + 1}>
                          <div className="table-detail-container">
                            <StoreDetail id={row.storeId} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
            </tbody>
          </table>

          <div
            className="pagination"
            style={{
              marginTop: "10px",
              display: "flex",
              justifyContent: "flex-start",
            }}
          >
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={"table-pagination-button"}
            >
              <MdOutlineArrowBackIosNew />
            </button>
            <span style={{ margin: "0 10px" }}>
              {currentPage} / {Math.ceil(filteredData.length / itemsPerPage)}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage * itemsPerPage >= filteredData.length}
              className={"table-pagination-button"}
            >
              <MdOutlineArrowForwardIos />
            </button>
          </div>
        </div>
      </Spin>
    </div>
  );
});

export default StoreScreen;
