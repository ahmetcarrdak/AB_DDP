import { memo, useState, useEffect } from "react";
import axios from "axios";
import { FaInfoCircle } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { Spin } from "antd";
import { apiUrl } from "../../Settings";

interface WorkDetailProps {
  id: number;
}

const WorkDetail = memo(({ id }: WorkDetailProps) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [work, setWork] = useState({
    workName: "",
    description: "",
    createdDate: new Date(),
    startDate: null,
    dueDate: null,
    completionDate: null,
    status: "",
    priority: "",
    assignedDepartmentId: 0,
    assignedEmployeeId: null,
    createdByEmployeeId: 0,
    location: "",
    estimatedCost: 0,
    actualCost: 0,
    estimatedDuration: 0,
    actualDuration: 0,
    requiredEquipment: "",
    requiredMaterials: "",
    workType: "",
    isRecurring: false,
    recurrencePattern: "",
    requiresApproval: false,
    approvedByEmployeeId: null,
    approvalDate: null,
    notes: "",
    isActive: true,
    cancellationReason: "",
    cancellationDate: null,
    qualityScore: null,
    qualityNotes: "",
    hasSafetyRisks: false,
    safetyNotes: "",
  });

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${apiUrl.workById}/${id}`);
        setWork(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return (
    <Spin spinning={loading} tip="İş verileri yükleniyor">
      <div className={"table-row-detail"}>
        <div className="table-row-detail-item">
          <h4>İş Detayları</h4>
          <div
            className={`dropdown ${
              activeDropdown === "workInfo" ? "active" : ""
            }`}
          >
            <div
              className="dropdown-title"
              onClick={() => toggleDropdown("workInfo")}
            >
              <FaInfoCircle />
              <span>İş Bilgileri</span>
              <IoIosArrowForward />
            </div>
            <div
              className={`dropdown-body ${
                activeDropdown === "workInfo" ? "active" : ""
              }`}
            >
              <div className="dropdown-item">
                <span style={{ fontWeight: "bold" }}>İş Adı:</span>
                {work.workName}
              </div>
              <div className="dropdown-item">
                <span style={{ fontWeight: "bold" }}>Durum:</span>
                {work.status}
              </div>
              <div className="dropdown-item">
                <span style={{ fontWeight: "bold" }}>Öncelik:</span>
                {work.priority}
              </div>
            </div>
          </div>

          <div
            className={`dropdown ${activeDropdown === "dates" ? "active" : ""}`}
          >
            <div
              className="dropdown-title"
              onClick={() => toggleDropdown("dates")}
            >
              <FaInfoCircle />
              <span>Tarih Bilgileri</span>
              <IoIosArrowForward />
            </div>
            <div
              className={`dropdown-body ${
                activeDropdown === "dates" ? "active" : ""
              }`}
            >
              <div className="dropdown-item">
                <span style={{ fontWeight: "bold" }}>Başlama Tarihi:</span>
                {work.startDate}
              </div>
              <div className="dropdown-item">
                <span style={{ fontWeight: "bold" }}>Bitiş Tarihi:</span>
                {work.dueDate}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Spin>
  );
});

export default WorkDetail;
