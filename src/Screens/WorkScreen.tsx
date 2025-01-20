import React, { memo, useEffect, useState } from "react";
import axios from "axios";
import HeaderComponent from "../Components/HeaderComponent";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {
  MdOutlineArrowBackIosNew,
  MdOutlineArrowForwardIos,
} from "react-icons/md";
import { apiUrl } from "../Settings";
import WorkDetail from "../Components/TableDetailComponent/WorkDetail";

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
  const [sortColumn, setSortColumn] = useState("");
  const [sortAscending, setSortAscending] = useState(true);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(apiUrl.work);
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { title: "İş Adı", data: "workName" },
    { title: "Durum", data: "status" },
    { title: "Öncelik", data: "priority" },
    { title: "Başlama Tarihi", data: "startDate" },
    { title: "Bitiş Tarihi", data: "dueDate" },
    { title: "Departman", data: "assignedDepartmentId" },
    { title: "Tip", data: "workType" },
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
            </tr>
          </thead>
          {loading ? (
            <tbody>
              <tr>
                <td colSpan={columns.length + 1}>Veriler yükleniyor...</td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((work) => (
                  <React.Fragment key={work.workId}>
                    <tr
                      onClick={() => toggleRow(work.workId)}
                      className={"table-tbody"}
                    >
                      <td>{work.workId}</td>
                      {columns.map((col) => (
                        <td key={col.data} className={"table-tbody-td"}>
                          {col.data === "isActive"
                            ? work[col.data]
                              ? "Aktif"
                              : "Pasif"
                            : work[col.data]}
                        </td>
                      ))}
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
          )}
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
    </div>
  );
});

export default WorkScreen;
