import React, { memo, useEffect, useState } from "react";
import axios from "axios";
import { FaInfoCircle } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { apiUrl } from "./../../Settings";
import { Spin } from "antd";

interface OrderDetailProps {
  id: number;
}

const OrderDetail = memo(({ id }: OrderDetailProps) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState({
    orderId: 0,
    orderDate: new Date(),
    customerName: "",
    deliveryAddress: "",
    customerPhone: "",
    customerEmail: "",
    productName: "",
    quantity: 0,
    unitPrice: 0,
    totalAmount: 0,
    orderStatus: "",
    estimatedDeliveryDate: null,
    actualDeliveryDate: null,
    paymentMethod: "",
    isPaid: false,
    paymentStatus: "",
    assignedEmployeeId: null,
    specialInstructions: "",
    priority: "",
    isActive: true,
    cancellationReason: "",
    cancellationDate: null,
    orderSource: "",
    discountAmount: 0,
    taxAmount: 0,
    invoiceNumber: "",
  });
  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${apiUrl.orderById}/${id}`);
        setOrder(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Verileri çekerken bir hata oluştu:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);



  return (
    <Spin spinning={loading} tip="Veriler yükleniyot">
      <div className={"table-row-detail"}>
        <div className="table-row-detail-item">
          <h4>Sipariş Detayları</h4>
          <div
            className={`dropdown ${activeDropdown === "order" ? "active" : ""}`}
          >
            <div
              className="dropdown-title"
              onClick={() => toggleDropdown("order")}
            >
              <FaInfoCircle />
              <span>Sipariş Bilgileri</span>
              <IoIosArrowForward />
            </div>
            <div
              className={`dropdown-body ${
                activeDropdown === "order" ? "active" : ""
              }`}
            >
              <div className="dropdown-item">
                <span style={{ fontWeight: "bold" }}>Sipariş No:</span>
                {order.orderId}
              </div>
              <div className="dropdown-item">
                <span style={{ fontWeight: "bold" }}>Sipariş Tarihi:</span>
                {new Date(order.orderDate).toLocaleDateString()}
              </div>
              <div className="dropdown-item">
                <span style={{ fontWeight: "bold" }}>Durum:</span>
                {order.orderStatus}
              </div>
            </div>
          </div>

          <div
            className={`dropdown ${
              activeDropdown === "customer" ? "active" : ""
            }`}
          >
            <div
              className="dropdown-title"
              onClick={() => toggleDropdown("customer")}
            >
              <FaInfoCircle />
              <span>Müşteri Bilgileri</span>
              <IoIosArrowForward />
            </div>
            <div
              className={`dropdown-body ${
                activeDropdown === "customer" ? "active" : ""
              }`}
            >
              <div className="dropdown-item">
                <span style={{ fontWeight: "bold" }}>Müşteri:</span>
                {order.customerName}
              </div>
              <div className="dropdown-item">
                <span style={{ fontWeight: "bold" }}>Telefon:</span>
                {order.customerPhone}
              </div>
              <div className="dropdown-item">
                <span style={{ fontWeight: "bold" }}>Email:</span>
                {order.customerEmail}
              </div>
            </div>
          </div>

          <div
            className={`dropdown ${
              activeDropdown === "payment" ? "active" : ""
            }`}
          >
            <div
              className="dropdown-title"
              onClick={() => toggleDropdown("payment")}
            >
              <FaInfoCircle />
              <span>Ödeme Bilgileri</span>
              <IoIosArrowForward />
            </div>
            <div
              className={`dropdown-body ${
                activeDropdown === "payment" ? "active" : ""
              }`}
            >
              <div className="dropdown-item">
                <span style={{ fontWeight: "bold" }}>Toplam Tutar:</span>
                {order.quantity * order.unitPrice}
              </div>
              <div className="dropdown-item">
                <span style={{ fontWeight: "bold" }}>Ödeme Yöntemi:</span>
                {order.paymentMethod}
              </div>
              <div className="dropdown-item">
                <span style={{ fontWeight: "bold" }}>Ödeme Durumu:</span>
                {order.paymentStatus}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Spin>
  );
});

export default OrderDetail;
