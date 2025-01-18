import React, { memo, useEffect, useState } from "react";
import axios from "axios";
import HeaderComponent from "../Components/HeaderComponent";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {
  MdOutlineArrowBackIosNew,
  MdOutlineArrowForwardIos,
} from "react-icons/md";
import { Spin } from "antd";
import { apiUrl } from "../Settings";
import PersonDetail from "../Components/TableDetailComponent/PersonDetail";

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
  return data.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(query.toLowerCase())
    )
  );
};

const PersonScreen = memo(() => {
  const [data, setData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [query, setQuery] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [sortAscending, setSortAscending] = useState(true);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(apiUrl.person);
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Verileri çekerken bir hata oluştu:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns = [
    { title: "Ad", data: "firstName" },
    { title: "Soyad", data: "lastName" },
    { title: "Departman", data: "department" },
    { title: "Pozisyon", data: "positionName" },
    { title: "Telefon", data: "phoneNumber" },
    { title: "Email", data: "email" },
    { title: "Durum", data: "isActive" },
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

  const toggleRow = (personId: number) => {
    setExpandedRow(expandedRow === personId ? null : personId);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const tableColumn = columns.map((col) => col.title);
    const tableRows = paginatedData.map((row) =>
      columns.map((col) => row[col.data])
    );
    //@ts-ignore
    doc.autoTable(tableColumn, tableRows);
    doc.save("personel.pdf");
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <HeaderComponent />
      </div>
      <Spin spinning={loading} tip="Personel verileri yükleniyor...">
        <div className="screen-body">
          <input
            type="text"
            placeholder="Arama..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="table-seach-input"
          />
          <div className="table-head">
            <label htmlFor="itemsPerPage"></label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="table-count-row"
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
            <button onClick={downloadPDF} className="table-action-button">
              PDF Olarak İndir
            </button>
          </div>

          <table className="table">
            <thead className="table-thead">
              <tr>
                <th>#</th>
                {columns.map((col) => (
                  <th
                    key={col.data}
                    onClick={() => handleSort(col.data)}
                    className="table-thead-th"
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
                  <React.Fragment key={row.id}>
                    <tr
                      onClick={() => toggleRow(row.id)}
                      className="table-tbody"
                    >
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>{" "}
                      {/* 1'den numaralandırma */}
                      {columns.map((col) => (
                        <td key={col.data} className="table-tbody-td">
                          {col.data === "isActive"
                            ? row[col.data]
                              ? "Aktif"
                              : "Pasif"
                            : row[col.data]}
                        </td>
                      ))}
                      <td>
                        <a
                          href={`person-update-user/${row.id}`}
                          className="edit-row-button"
                          onClick={(e) => {
                            e.stopPropagation(); // Satırın tıklanmasını engelle
                          }}
                        >
                          Düzenle
                        </a>
                      </td>
                    </tr>

                    {expandedRow === row.id && (
                      <tr>
                        <td colSpan={columns.length + 1}>
                          <PersonDetail id={row.id} />
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
              className="table-pagination-button"
            >
              <MdOutlineArrowBackIosNew />
            </button>
            <span style={{ margin: "0 10px" }}>
              {currentPage} / {Math.ceil(filteredData.length / itemsPerPage)}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage * itemsPerPage >= filteredData.length}
              className="table-pagination-button"
            >
              <MdOutlineArrowForwardIos />
            </button>
          </div>
        </div>
      </Spin>
    </div>
  );
});

export default PersonScreen;
