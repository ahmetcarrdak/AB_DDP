import React, { memo, useEffect, useState, useRef } from "react";
import axios from "axios";
import HeaderComponent from "../Components/HeaderComponent";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {
  MdOutlineArrowBackIosNew,
  MdOutlineArrowForwardIos,
} from "react-icons/md";
import { Spin, Modal, Button } from "antd";
import { apiUrl } from "../Settings";
import WorkDetail from "../Components/TableDetailComponent/WorkDetail";
import Barcode from "react-barcode";
import html2canvas from "html2canvas"; // html2canvas kütüphanesini içe aktar

// Pagination ve sıralama yardımcı fonksiyonları
const paginateData = (
  data: any[],
  currentPage: number,
  itemsPerPage: number
) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  return data.slice(startIndex, startIndex + itemsPerPage);
};

const sortData = (data: any[], column: string, ascending: boolean) => {
  return data.sort((a, b) => {
    if (a[column] < b[column]) return ascending ? -1 : 1;
    if (a[column] > b[column]) return ascending ? 1 : -1;
    return 0;
  });
};

const filterData = (data: any[], query: string) => {
  if (!query) return data;
  return data.filter((row) => {
    return Object.values(row).some((value) =>
      String(value).toLowerCase().includes(query.toLowerCase())
    );
  });
};

const WorkScreen = memo(() => {
  const [data, setData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [query, setQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortAscending, setSortAscending] = useState(true);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBarcodeModalVisible, setBarcodeModalVisible] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState("");

  const barcodeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(apiUrl.work);
        setData(response.data);
      } catch (error) {
        console.error("Veri alma hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBarcodeClick = (barcode: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
      } catch (error) {
        console.error("Barkod indirme hatası:", error);
      }
    } else {
      console.error("Barkod referansı bulunamadı");
    }
  };

  const columns = [
    { title: "İş Adı", data: "workName" },
    { title: "Durum", data: "status" },
    { title: "Çalışan Personel", data: "assignedEmployeeId" },
    { title: "Gerekli Ekipman", data: "requiredEquipment" },
    { title: "Gerekli Malzeme", data: "requiredMaterials" },
    { title: "Barkod", data: "barcode" },
    { title: "Öncelik", data: "priority" },
    { title: "Aktif", data: "isActive" },
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

  const toggleRow = (workId: number) => {
    setExpandedRow(expandedRow === workId ? null : workId);
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <HeaderComponent />
      </div>
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
          <button
            onClick={() => {
              const doc = new jsPDF();
              const tableColumn = columns.map((col) => col.title);
              const tableRows = paginatedData.map((row) =>
                columns.map((col) => row[col.data])
              );
              //@ts-ignore
              doc.autoTable(tableColumn, tableRows);
              doc.save("isler.pdf");
            }}
            className={"table-action-button"}
          >
            PDF Olarak İndir
          </button>
        </div>

        <Spin spinning={loading} tip="Loading...">
          <table className="table">
            <thead className={"table-thead"}>
              <tr>
                <th>#</th>
                {columns.map((column) => (
                  <th
                    key={column.data}
                    onClick={() => handleSort(column.data)}
                    className={"table-thead-th"}
                  >
                    {column.title}{" "}
                    {sortColumn === column.data && (sortAscending ? "↑" : "↓")}
                  </th>
                ))}
                <th>#</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length > 0 &&
                paginatedData.map((work, index) => (
                  <React.Fragment key={work.workId}>
                    <tr
                      onClick={() => toggleRow(work.workId)}
                      className={"table-tbody"}
                    >
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      {columns.map((col) => (
                        <td key={col.data} className={"table-tbody-td"}>
                          {col.data === "barcode" ? (
                            <a
                              onClick={(e) =>
                                handleBarcodeClick(work[col.data], e)
                              }
                              style={{ color: "#1890ff", cursor: "pointer" }}
                            >
                              {work[col.data]}
                            </a>
                          ) : col.data === "isActive" ? (
                            work[col.data] ? (
                              "Aktif"
                            ) : (
                              "Pasif"
                            )
                          ) : (
                            work[col.data]
                          )}
                        </td>
                      ))}
                      <td>
                        <a
                          href={`work-update-work/${work.workId}`}
                          className="edit-row-button"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          Düzenle
                        </a>
                      </td>
                    </tr>

                    {expandedRow === work.workId && (
                      <tr>
                        <td colSpan={columns.length + 1}>
                          <div className="table-detail-container">
                            <WorkDetail id={work.workId} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
            </tbody>
          </table>
        </Spin>
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

      <Modal
        title="Barkod Görüntüleme"
        open={isBarcodeModalVisible}
        onCancel={() => setBarcodeModalVisible(false)}
        footer={[
          <Button key="download" type="primary" onClick={handleBarcodeDownload}>
            Barkodu İndir
          </Button>,
          <Button key="close" onClick={() => setBarcodeModalVisible(false)}>
            Kapat
          </Button>,
        ]}
        centered
        width={400}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "20px 0",
          }}
          ref={barcodeRef}
        >
          <Barcode
            value={selectedBarcode || ""}
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
    </div>
  );
});

export default WorkScreen;
