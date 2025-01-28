import React, { memo, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import HeaderComponent from "../Components/HeaderComponent";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {
  MdOutlineArrowBackIosNew,
  MdOutlineArrowForwardIos,
} from "react-icons/md";
import { IoIosAdd } from "react-icons/io";
import { apiUrl } from "./../Settings";
import OrderDetail from "../Components/TableDetailComponent/OrderDetail";
import { Spin } from "antd";
import { AiOutlineFilePdf } from "react-icons/ai";

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

const OrderScreen = memo(() => {
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
        const response = await axios.get(`${apiUrl.order}`);
        const updatedData = response.data.map((order: any) => ({
          ...order,
          totalAmount: order.quantity * order.unitPrice, // totalAmount hesaplaması
        }));
        setData(updatedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { title: "Sipariş No", data: "orderId" },
    { title: "Müşteri", data: "customerName" },
    { title: "Ürün", data: "productName" },
    { title: "Tutar", data: "totalAmount" },
    { title: "Durum", data: "orderStatus" },
    { title: "Öncelik", data: "priority" },
    { title: "Ödeme Durumu", data: "paymentStatus" },
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

  const toggleRow = (orderId: number) => {
    setExpandedRow(expandedRow === orderId ? null : orderId);
  };

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
                doc.save("siparisler.pdf");
              }}
              className={"table-action-button"}
            >
              <AiOutlineFilePdf />
              <span style={{ paddingLeft: 10 }}>PDF Olarak İndir</span>
            </button>
            <Link to={"/order-create"} className={"table-action-button"}>
              <IoIosAdd />
              <span style={{ paddingLeft: 10 }}>Sipariş Ekle</span>
            </Link>
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
                <th>#</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((order, index) => (
                  <React.Fragment key={order.orderId}>
                    <tr
                      onClick={() => toggleRow(order.orderId)}
                      className={"table-tbody"}
                    >
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      {columns.map((col) => (
                        <td key={col.data} className={"table-tbody-td"}>
                          {col.data === "isActive"
                            ? order[col.data]
                              ? "Aktif"
                              : "Pasif"
                            : order[col.data]}
                        </td>
                      ))}
                      <td>
                        <a
                          href={`order-update-order/${order.orderId}`}
                          className="edit-row-button"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          Düzenle
                        </a>
                      </td>
                    </tr>

                    {expandedRow === order.orderId && (
                      <tr>
                        <td colSpan={columns.length + 1}>
                          <div className="table-detail-container">
                            <OrderDetail id={order.orderId} />
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

export default OrderScreen;
