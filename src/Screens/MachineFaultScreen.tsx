import React, { memo, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import HeaderComponent from "../Components/HeaderComponent";
import { Spin, Tag } from "antd";
import { AiOutlineFilePdf } from "react-icons/ai";
import {
  MdOutlineArrowBackIosNew,
  MdOutlineArrowForwardIos,
} from "react-icons/md";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { apiUrl } from "./../Settings";
import { IoIosAdd } from "react-icons/io";

const paginateData = (
  data: any[],
  currentPage: number,
  itemsPerPage: number
) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  return data.slice(startIndex, startIndex + itemsPerPage);
};

const sortData = (data: any[], column: string, ascending: boolean) => {
  return [...data].sort((a, b) => {
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

const MachineFaultScreen = memo(() => {
  const [data, setData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [query, setQuery] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [sortAscending, setSortAscending] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${apiUrl.machineFault}`);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const columns = [
    { title: "Makine Adı", data: "machine.name" },
    { title: "Makine Kodu", data: "machine.code" },
    { title: "Arıza Başlangıç", data: "faultStartDate" },
    { title: "Arıza Bitiş", data: "faultEndDate" },
    { title: "Açıklama", data: "faultDescription" },
    { title: "Sebep", data: "cause" },
    { title: "Çözüm", data: "solution" },
    { title: "Şiddet", data: "faultSeverity" },
    { title: "Bildiren", data: "reportedBy" },
    { title: "Çözen", data: "resolvedBy" },
    { title: "Çözüldü mü?", data: "isResolved" },
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

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("tr-TR");

  return (
    <div className="screen">
      <div className="screen-header">
        <HeaderComponent />
      </div>
      <Spin spinning={loading} tip="Veriler yükleniyor">
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
            <button
              onClick={() => {
                const doc = new jsPDF();
                const tableColumn = columns.map((col) => col.title);
                const tableRows = paginatedData.map((row) =>
                  columns.map((col) => {
                    if (
                      col.data === "faultStartDate" ||
                      col.data === "faultEndDate"
                    ) {
                      return formatDate(row[col.data]);
                    }
                    if (col.data === "isResolved") {
                      return row[col.data] ? "Evet" : "Hayır";
                    }
                    return col.data.includes(".")
                      ? col.data.split(".").reduce((o, k) => (o || {})[k], row)
                      : row[col.data];
                  })
                );
                //@ts-ignore
                doc.autoTable(tableColumn, tableRows);
                doc.save("makine_arizalari.pdf");
              }}
              className="table-action-button"
            >
              <AiOutlineFilePdf />
              <span style={{ paddingLeft: 10 }}>PDF Olarak İndir</span>
            </button>
            <Link to="/machine-fault-create" className="table-action-button">
              <IoIosAdd />
              <span style={{ paddingLeft: 10 }}>Makine Arızası Ekle</span>
            </Link>
          </div>

          <table className="table">
            <thead className="table-thead">
              <tr>
                <th>#</th>
                {columns.map((column) => (
                  <th
                    key={column.data}
                    onClick={() => handleSort(column.data)}
                    className="table-thead-th"
                  >
                    {column.title}{" "}
                    {sortColumn === column.data && (sortAscending ? "↑" : "↓")}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((fault, index) => (
                  <tr key={fault.faultId} className="table-tbody">
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    {columns.map((col) => (
                      <td key={col.data} className="table-tbody-td">
                        {col.data === "faultStartDate" ||
                        col.data === "faultEndDate" ? (
                          formatDate(fault[col.data])
                        ) : col.data === "isResolved" ? (
                          <Tag color={fault[col.data] ? "green" : "red"}>
                            {fault[col.data] ? "Evet" : "Hayır"}
                          </Tag>
                        ) : col.data.includes(".") ? (
                          col.data
                            .split(".")
                            .reduce((o, k) => (o || {})[k], fault)
                        ) : (
                          fault[col.data]
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    style={{ textAlign: "center" }}
                  >
                    Veri bulunamadı
                  </td>
                </tr>
              )}
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

export default MachineFaultScreen;
