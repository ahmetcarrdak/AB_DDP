import React, { memo, useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaCalendarAlt } from "react-icons/fa";

import { CiDiscount1 } from "react-icons/ci";
import { GrInfo } from "react-icons/gr";
import { IoIosAlbums, IoIosArrowForward, IoIosCheckmark } from "react-icons/io";
import { LiaTimesSolid } from "react-icons/lia";
import { apiUrl } from "../../Settings";

interface StoreDetailProps {
  id: number;
}

const StoreDetail = memo(({ id }: StoreDetailProps) => {
  const [data, setData] = useState<any[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState({
    purchaseDate: "",
    expiryDate: "",
    lastInventoryDate: "",
    quantity: 0,
    unitPrice: 0,
    weight: 0,
    minimumStockLevel: 0,
    maximumStockLevel: 0,
    name: "",
    barcode: "",
    serialNumber: "",
    unit: "",
    dimensions: "",
    description: "",
    category: "",
    supplierInfo: "",
    location: "",
    storageConditions: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl.storeById}/${id}`);
        setData(response.data);
        setRow({
          purchaseDate: response.data.purchaseDate || "",
          expiryDate: response.data.expiryDate || "",
          lastInventoryDate: response.data.lastInventoryDate || "",
          quantity: response.data.quantity || 0,
          unitPrice: response.data.unitPrice || 0,
          weight: response.data.weight || 0,
          minimumStockLevel: response.data.minimumStockLevel || 0,
          maximumStockLevel: response.data.maximumStockLevel || 0,
          name: response.data.name || "",
          barcode: response.data.barcode || "",
          serialNumber: response.data.serialNumber || "",
          unit: response.data.unit || "",
          dimensions: response.data.dimensions || "",
          description: response.data.description || "",
          category: response.data.category || "",
          supplierInfo: response.data.supplierInfo || "",
          location: response.data.location || "",
          storageConditions: response.data.storageConditions || "",
        });
      } catch (error) {
        console.error("Verileri çekerken bir hata oluştu:", error);
      }
    };
    fetchData();
  }, []);

  // Stok durumu grafiği için renk belirleme
  const StockStatusChart = ({ quantity, upperLimit, lowerLimit }: any) => {
    let fillColor = "#8884d8"; // Varsayılan renk

    if (quantity > upperLimit) {
      fillColor = "#40E0D0"; // Turkuaz, üst limitin üzerinde
    } else if (quantity < lowerLimit) {
      fillColor = "#FF6347"; // Kırmızı, alt limitin altında
    } else {
      fillColor = "#9370DB"; // Morumsu, limitsel aralıkta
    }

    // YAxis için domain aralığını dinamik olarak hesaplayalım
    const minValue = 0; //Math.min(quantity, lowerLimit);
    const maxValue = Math.max(quantity, upperLimit);

    // Grafik için yeni domain aralığını belirleyelim
    const yAxisDomain = [minValue - minValue * 0.1, maxValue + maxValue * 0.1]; // %10'luk bir aralık ekleyerek genişletiyoruz

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={[{ name: "Stok", quantity }]}>
          <XAxis dataKey="name" />
          <YAxis domain={yAxisDomain} /> {/* Dinamik domain */}
          <Tooltip />
          <Bar dataKey="quantity" fill={fillColor} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  return (
    <div className={"table-row-detail"}>
      <div className="table-row-detail-item">
        <h4>Ürün Stok Durumu</h4>
        <StockStatusChart
          quantity={row.quantity}
          upperLimit={row.maximumStockLevel}
          lowerLimit={row.minimumStockLevel}
        />
      </div>
      <div className="table-row-detail-item">
        <h4>Bilgi Kategorileri</h4>

        {/* Tarihler */}
        <div
          className={`dropdown ${activeDropdown === "dates" ? "active" : ""}`}
        >
          <div
            className="dropdown-title"
            onClick={() => toggleDropdown("dates")}
          >
            <FaCalendarAlt />
            <span>Tarihler</span>
            <IoIosArrowForward />
          </div>
          <div
            className={`dropdown-body ${
              activeDropdown === "dates" ? "active" : ""
            }`}
          >
            <div className="dropdown-item">
              <span style={{ fontWeight: "bold" }}>Satın alma tarihi:</span>
              {new Date(row.purchaseDate).toLocaleDateString()}
              {row.purchaseDate ? (
                <span style={{ color: "#83f333" }}>
                  <IoIosCheckmark />
                </span>
              ) : (
                <span style={{ color: "#d51883" }}>
                  <LiaTimesSolid />
                </span>
              )}
            </div>
            <div className="dropdown-item">
              <span style={{ fontWeight: "bold" }}>Son kullanma tarihi:</span>
              {row.expiryDate
                ? new Date(row.expiryDate).toLocaleDateString()
                : "Girilmemiş"}
              {row.expiryDate ? (
                <span style={{ color: "#83f333" }}>
                  <IoIosCheckmark />
                </span>
              ) : (
                <span style={{ color: "#d51883" }}>
                  <LiaTimesSolid />
                </span>
              )}
            </div>
            <div className="dropdown-item">
              <span style={{ fontWeight: "bold" }}>Son envanter tarihi:</span>

              {new Date(row.lastInventoryDate).toLocaleDateString()}
              {row.lastInventoryDate ? (
                <span style={{ color: "#83f333" }}>
                  <IoIosCheckmark />
                </span>
              ) : (
                <span style={{ color: "#d51883" }}>
                  <LiaTimesSolid />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sayısal Değerler */}
        <div
          className={`dropdown ${activeDropdown === "numbers" ? "active" : ""}`}
        >
          <div
            className="dropdown-title"
            onClick={() => toggleDropdown("numbers")}
          >
            <CiDiscount1 />
            <span>Sayısal Değerler</span>
            <IoIosArrowForward />
          </div>
          <div
            className={`dropdown-body ${
              activeDropdown === "numbers" ? "active" : ""
            }`}
          >
            <div className="dropdown-item">
              <span style={{ fontWeight: "bold" }}>Stok miktarı:</span>
              {row.quantity}
              {row.quantity !== null && row.quantity !== undefined ? (
                <span style={{ color: "#83f333" }}>
                  <IoIosCheckmark />
                </span>
              ) : (
                <span style={{ color: "#d51883" }}>
                  <LiaTimesSolid />
                </span>
              )}
            </div>
            <div className="dropdown-item">
              <span style={{ fontWeight: "bold" }}>Birim fiyatı:</span>
              {row.unitPrice.toFixed(2)} ₺
              {row.unitPrice ? (
                <span style={{ color: "#83f333" }}>
                  <IoIosCheckmark />
                </span>
              ) : (
                <span style={{ color: "#d51883" }}>
                  <LiaTimesSolid />
                </span>
              )}
            </div>
            <div className="dropdown-item">
              <span style={{ fontWeight: "bold" }}>Ağırlık:</span>
              {row.weight} kg
              {row.weight ? (
                <span style={{ color: "#83f333" }}>
                  <IoIosCheckmark />
                </span>
              ) : (
                <span style={{ color: "#d51883" }}>
                  <LiaTimesSolid />
                </span>
              )}
            </div>
            <div className="dropdown-item">
              <span style={{ fontWeight: "bold" }}>Minimum stok seviyesi:</span>
              {row.minimumStockLevel}
              {row.minimumStockLevel ? (
                <span style={{ color: "#83f333" }}>
                  <IoIosCheckmark />
                </span>
              ) : (
                <span style={{ color: "#d51883" }}>
                  <LiaTimesSolid />
                </span>
              )}
            </div>
            <div className="dropdown-item">
              <span style={{ fontWeight: "bold" }}>
                Maksimum stok seviyesi:
              </span>
              {row.maximumStockLevel}
              {row.maximumStockLevel ? (
                <span style={{ color: "#83f333" }}>
                  <IoIosCheckmark />
                </span>
              ) : (
                <span style={{ color: "#d51883" }}>
                  <LiaTimesSolid />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tanımlayıcı Bilgiler */}
        <div
          className={`dropdown ${
            activeDropdown === "identifiers" ? "active" : ""
          }`}
        >
          <div
            className="dropdown-title"
            onClick={() => toggleDropdown("identifiers")}
          >
            <GrInfo />
            <span>Tanımlayıcı Bilgiler</span>
            <IoIosArrowForward />
          </div>
          <div
            className={`dropdown-body ${
              activeDropdown === "identifiers" ? "active" : ""
            }`}
          >
            <div className="dropdown-item">
              <span style={{ fontWeight: "bold" }}>Ürün Adı:</span>
              {row.name || "Girilmemiş"}
              {row.name ? (
                <span style={{ color: "#83f333" }}>
                  <IoIosCheckmark />
                </span>
              ) : (
                <span style={{ color: "#d51883" }}>
                  <LiaTimesSolid />
                </span>
              )}
            </div>
            <div className="dropdown-item">
              <span style={{ fontWeight: "bold" }}>Barkod:</span>
              {row.barcode || "Girilmemiş"}
              {row.barcode ? (
                <span style={{ color: "#83f333" }}>
                  <IoIosCheckmark />
                </span>
              ) : (
                <span style={{ color: "#d51883" }}>
                  <LiaTimesSolid />
                </span>
              )}
            </div>
            <div className="dropdown-item">
              <span style={{ fontWeight: "bold" }}>Seri numarası:</span>
              {row.serialNumber || "Girilmemiş"}
              {row.serialNumber ? (
                <span style={{ color: "#83f333" }}>
                  <IoIosCheckmark />
                </span>
              ) : (
                <span style={{ color: "#d51883" }}>
                  <LiaTimesSolid />
                </span>
              )}
            </div>
            <div className="dropdown-item">
              <span style={{ fontWeight: "bold" }}>Birim:</span>
              {row.unit || "Girilmemiş"}
              {row.unit ? (
                <span style={{ color: "#83f333" }}>
                  <IoIosCheckmark />
                </span>
              ) : (
                <span style={{ color: "#d51883" }}>
                  <LiaTimesSolid />
                </span>
              )}
            </div>
            <div className="dropdown-item">
              <span style={{ fontWeight: "bold" }}>Boyutlar:</span>{" "}
              {row.dimensions || "Girilmemiş"}
              {row.dimensions ? (
                <span style={{ color: "#83f333" }}>
                  <IoIosCheckmark />
                </span>
              ) : (
                <span style={{ color: "#d51883" }}>
                  <LiaTimesSolid />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Diğer Bilgiler */}
        <div
          className={`dropdown ${activeDropdown === "others" ? "active" : ""}`}
        >
          <div
            className="dropdown-title"
            onClick={() => toggleDropdown("others")}
          >
            <IoIosAlbums />
            <span>Diğer Bilgiler</span>
            <IoIosArrowForward />
          </div>
          <div
            className={`dropdown-body ${
              activeDropdown === "others" ? "active" : ""
            }`}
          >
            <div className="dropdown-item">
              <span style={{ fontWeight: "bold" }}>Açıklama:</span>{" "}
              {row.description || "Girilmemiş"}
              {row.description ? (
                <span style={{ color: "#83f333" }}>
                  <IoIosCheckmark />
                </span>
              ) : (
                <span style={{ color: "#d51883" }}>
                  <LiaTimesSolid />
                </span>
              )}
            </div>
            <div className="dropdown-item">
              <span style={{ fontWeight: "bold" }}>Kategori:</span>{" "}
              {row.category || "Girilmemiş"}
              {row.category ? (
                <span style={{ color: "#83f333" }}>
                  <IoIosCheckmark />
                </span>
              ) : (
                <span style={{ color: "#d51883" }}>
                  <LiaTimesSolid />
                </span>
              )}
            </div>
            <div className="dropdown-item">
              <span style={{ fontWeight: "bold" }}>Tedarikçi bilgisi:</span>{" "}
              {row.supplierInfo || "Girilmemiş"}
              {row.supplierInfo ? (
                <span style={{ color: "#83f333" }}>
                  <IoIosCheckmark />
                </span>
              ) : (
                <span style={{ color: "#d51883" }}>
                  <LiaTimesSolid />
                </span>
              )}
            </div>
            <div className="dropdown-item">
              <span style={{ fontWeight: "bold" }}>Depo konumu:</span>
              {row.location || "Girilmemiş"}
              {row.location ? (
                <span style={{ color: "#83f333" }}>
                  <IoIosCheckmark />
                </span>
              ) : (
                <span style={{ color: "#d51883" }}>
                  <LiaTimesSolid />
                </span>
              )}
            </div>
            <div className="dropdown-item">
              <span style={{ fontWeight: "bold" }}>Depo koşulları:</span>{" "}
              {row.storageConditions || "Girilmemiş"}
              {row.storageConditions ? (
                <span style={{ color: "#83f333" }}>
                  <IoIosCheckmark />
                </span>
              ) : (
                <span style={{ color: "#d51883" }}>
                  <LiaTimesSolid />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default StoreDetail;
