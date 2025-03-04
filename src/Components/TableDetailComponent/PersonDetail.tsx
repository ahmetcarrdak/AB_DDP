import React, { memo, useState, useEffect } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import axios from "axios";
import { apiUrl } from "../../Settings";
import apiClient from "../../Utils/ApiClient";

interface Position {
  positionId: number;
  positionName: string;
}

interface PersonDetailProps {
  id: number;
}

const PersonDetail = memo(({ id }: PersonDetailProps) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [row, setRow] = useState({
    firstName: "",
    lastName: "",
    identityNumber: "",
    birthDate: "",
    address: "",
    phoneNumber: "",
    email: "",
    hireDate: "",
    terminationDate: "",
    department: "",
    positionName: "",
    salary: 0,
    isActive: true,
    bloodType: "",
    emergencyContact: "",
    emergencyPhone: "",
    educationLevel: "",
    hasDriverLicense: false,
    notes: "",
    vacationDays: 0,
    hasHealthInsurance: false,
    lastHealthCheck: "",
    shiftSchedule: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Yüklemeyi başlatıyoruz
      try {
        const response = await apiClient.get(`${apiUrl.personById}/${id}`); // apiClient ile veri çekme
        setRow(response.data); // Row verisini set ediyoruz
      } catch (error) {
        console.error("Verileri çekerken bir hata oluştu:", error);
      } finally {
        setLoading(false); // Yükleme işlemi bitiyor
      }
    };

    fetchData(); // Verileri çekme fonksiyonu çalıştırılıyor
  }, [id]); // id değiştiğinde fetchData tekrar çalışır

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  return (
    <div className="table-detail-container">
      <div className={"table-row-detail"}>
        <div className="table-row-detail-item">
          <h4>Personel Bilgileri</h4>

          <div
            className={`dropdown ${
              activeDropdown === "personal" ? "active" : ""
            }`}
          >
            <div
              className="dropdown-title"
              onClick={() => toggleDropdown("personal")}
            >
              <FaInfoCircle />
              <span>Kişisel Bilgiler</span>
              <IoIosArrowForward />
            </div>
            <div
              className={`dropdown-body ${
                activeDropdown === "personal" ? "active" : ""
              }`}
            >
              <div className="dropdown-item">
                <strong>Ad Soyad:</strong> {`${row.firstName} ${row.lastName}`}
              </div>
              <div className="dropdown-item">
                <strong>TC Kimlik No:</strong> {row.identityNumber}
              </div>
              <div className="dropdown-item">
                <strong>Doğum Tarihi:</strong>{" "}
                {new Date(row.birthDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div
            className={`dropdown ${
              activeDropdown === "contact" ? "active" : ""
            }`}
          >
            <div
              className="dropdown-title"
              onClick={() => toggleDropdown("contact")}
            >
              <FaInfoCircle />
              <span>İletişim Bilgileri</span>
              <IoIosArrowForward />
            </div>
            <div
              className={`dropdown-body ${
                activeDropdown === "contact" ? "active" : ""
              }`}
            >
              <div className="dropdown-item">
                <strong>Telefon:</strong> {row.phoneNumber}
              </div>
              <div className="dropdown-item">
                <strong>Email:</strong> {row.email}
              </div>
              <div className="dropdown-item">
                <strong>Adres:</strong> {row.address}
              </div>
            </div>
          </div>

          <div
            className={`dropdown ${activeDropdown === "work" ? "active" : ""}`}
          >
            <div
              className="dropdown-title"
              onClick={() => toggleDropdown("work")}
            >
              <FaInfoCircle />
              <span>İş Bilgileri</span>
              <IoIosArrowForward />
            </div>
            <div
              className={`dropdown-body ${
                activeDropdown === "work" ? "active" : ""
              }`}
            >
              <div className="dropdown-item">
                <strong>Departman:</strong> {row.department}
              </div>
              <div className="dropdown-item">
                <strong>Pozisyon:</strong> {row.positionName}
              </div>
              <div className="dropdown-item">
                <strong>Maaş:</strong> {row.salary}
              </div>
            </div>
          </div>

          <div
            className={`dropdown ${activeDropdown === "other" ? "active" : ""}`}
          >
            <div
              className="dropdown-title"
              onClick={() => toggleDropdown("other")}
            >
              <FaInfoCircle />
              <span>Diğer Bilgiler</span>
              <IoIosArrowForward />
            </div>
            <div
              className={`dropdown-body ${
                activeDropdown === "other" ? "active" : ""
              }`}
            >
              <div className="dropdown-item">
                <strong>Kan Grubu:</strong> {row.bloodType}
              </div>
              <div className="dropdown-item">
                <strong>Eğitim Seviyesi:</strong> {row.educationLevel}
              </div>
              <div className="dropdown-item">
                <strong>Vardiya Planı:</strong> {row.shiftSchedule}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PersonDetail;
