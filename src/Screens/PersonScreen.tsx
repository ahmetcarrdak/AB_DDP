import React, {memo, useEffect, useState} from 'react';
import axios from 'axios';
import HeaderComponent from '../Components/HeaderComponent';
import {jsPDF} from 'jspdf';
import 'jspdf-autotable';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {FaInfoCircle, FaCalendarAlt} from 'react-icons/fa';
import {MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos} from "react-icons/md";
import {CiDiscount1} from "react-icons/ci";
import {GrInfo} from "react-icons/gr";
import {IoIosAlbums, IoIosArrowForward, IoIosCheckmark} from "react-icons/io";
import {LiaTimesSolid} from "react-icons/lia";
import {apiUrl} from "./../Settings";

const paginateData = (data: any[], currentPage: number, itemsPerPage: number) => {
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

const PersonScreen = memo(() => {
    const [data, setData] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [query, setQuery] = useState('');
    const [sortColumn, setSortColumn] = useState('');
    const [sortAscending, setSortAscending] = useState(true);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [row, setRow] = useState({
        firstName: '',
        lastName: '',
        identityNumber: '',
        birthDate: '',
        address: '',
        phoneNumber: '',
        email: '',
        hireDate: '',
        terminationDate: '',
        department: '',
        position: '',
        salary: 0,
        isActive: true,
        bloodType: '',
        emergencyContact: '',
        emergencyPhone: '',
        educationLevel: '',
        hasDriverLicense: false,
        notes: '',
        vacationDays: 0,
        hasHealthInsurance: false,
        lastHealthCheck: '',
        shiftSchedule: ''
    });
    const [loading, setLoading] = useState(true); // Başlangıçta loading durumu true


    const toggleDropdown = (dropdown: string) => {
        setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(apiUrl.person);
                setData(response.data); // Veriyi state'e al
                setLoading(false); // Veriler yüklendiğinde loading'i false yap
            } catch (error) {
                console.error('Verileri çekerken bir hata oluştu:', error);
                setLoading(false); // Hata olsa bile loading'i false yap
            }
        };

        fetchData(); // Veri çekme fonksiyonunu çağır
    }, []);

    const columns = [
        {title: 'Ad', data: 'firstName'},
        {title: 'Soyad', data: 'lastName'},
        {title: 'TC Kimlik No', data: 'identityNumber'},
        {title: 'Departman', data: 'department'},
        {title: 'Pozisyon', data: 'position'},
        {title: 'Telefon', data: 'phoneNumber'},
        {title: 'Email', data: 'email'},
        {title: 'Durum', data: 'isActive'},
    ];

    const filteredData = filterData(data, query);
    const sortedData = sortColumn ? sortData(filteredData, sortColumn, sortAscending) : filteredData;
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
        const tableColumn = columns.map(col => col.title);
        const tableRows = paginatedData.map(row =>
            columns.map(col => row[col.data])
        );
        //@ts-ignore
        doc.autoTable(tableColumn, tableRows);
        doc.save('personel.pdf');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const value = e.target.type === 'number' ? parseFloat(e.target.value) :
            e.target.type === 'checkbox' ? e.target.checked :
                e.target.value;

        setRow((prevRow) => ({
            ...prevRow,
            [field]: value,
        }));
    };

    return (
        <div className="screen">
            <div className="screen-header">
                <HeaderComponent/>
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
                        onClick={downloadPDF}
                        className={"table-action-button"}
                    >
                        PDF Olarak İndir
                    </button>
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
                                {col.title} {sortColumn === col.data && (sortAscending ? '↑' : '↓')}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    {loading ? (
                        <p>Veriler yükleniyor...</p> // Veriler yüklenirken bu mesaj gösterilecek
                    ) : (
                        <tbody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row) => (
                                <React.Fragment key={row.id}>
                                    <tr onClick={() => toggleRow(row.id)} className={"table-tbody"}>
                                        <td>{row.id}</td>
                                        {columns.map((col) => (
                                            <td key={col.data} className={"table-tbody-td"}>
                                                {col.data === 'isActive' ?
                                                    (row[col.data] ? 'Aktif' : 'Pasif') :
                                                    row[col.data]}
                                            </td>
                                        ))}
                                    </tr>

                                    {expandedRow === row.id && (
                                        <tr>
                                            <td colSpan={columns.length + 1}>
                                                <div className="table-detail-container">
                                                    <div className="detail-section">
                                                        <div className={`checkbox ${editMode && 'active'}`}
                                                             onClick={() => setEditMode(!editMode)}>
                                                            <div
                                                                className={`checkbox-box ${editMode && 'active'}`}></div>
                                                        </div>
                                                        <span style={{marginLeft: 20}}></span>
                                                        Düzenleme Modu {editMode ? ('Aktif') : ('Aktifleştirin')}
                                                    </div>

                                                    {editMode ? (
                                                        <form className="table-form">
                                                            {/* Kişisel Bilgiler */}
                                                            <div className="table-form-group">
                                                                <div className="table-form-title">Kişisel Bilgiler</div>
                                                                <div className="table-form-row">
                                                                    <div className="table-form-col">
                                                                        <label className="table-form-label">Ad:</label>
                                                                        <input
                                                                            type="text"
                                                                            className="table-form-input"
                                                                            value={row.firstName}
                                                                            onChange={(e) => handleInputChange(e, 'firstName')}
                                                                        />
                                                                    </div>
                                                                    <div className="table-form-col">
                                                                        <label
                                                                            className="table-form-label">Soyad:</label>
                                                                        <input
                                                                            type="text"
                                                                            className="table-form-input"
                                                                            value={row.lastName}
                                                                            onChange={(e) => handleInputChange(e, 'lastName')}
                                                                        />
                                                                    </div>
                                                                    <div className="table-form-col">
                                                                        <label className="table-form-label">TC Kimlik
                                                                            No:</label>
                                                                        <input
                                                                            type="text"
                                                                            className="table-form-input"
                                                                            value={row.identityNumber}
                                                                            onChange={(e) => handleInputChange(e, 'identityNumber')}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* İletişim Bilgileri */}
                                                            <div className="table-form-group">
                                                                <div className="table-form-title">İletişim Bilgileri
                                                                </div>
                                                                <div className="table-form-row">
                                                                    <div className="table-form-col">
                                                                        <label
                                                                            className="table-form-label">Telefon:</label>
                                                                        <input
                                                                            type="text"
                                                                            className="table-form-input"
                                                                            value={row.phoneNumber}
                                                                            onChange={(e) => handleInputChange(e, 'phoneNumber')}
                                                                        />
                                                                    </div>
                                                                    <div className="table-form-col">
                                                                        <label
                                                                            className="table-form-label">Email:</label>
                                                                        <input
                                                                            type="email"
                                                                            className="table-form-input"
                                                                            value={row.email}
                                                                            onChange={(e) => handleInputChange(e, 'email')}
                                                                        />
                                                                    </div>
                                                                    <div className="table-form-col">
                                                                        <label
                                                                            className="table-form-label">Adres:</label>
                                                                        <input
                                                                            type="text"
                                                                            className="table-form-input"
                                                                            value={row.address}
                                                                            onChange={(e) => handleInputChange(e, 'address')}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* İş Bilgileri */}
                                                            <div className="table-form-group">
                                                                <div className="table-form-title">İş Bilgileri</div>
                                                                <div className="table-form-row">
                                                                    <div className="table-form-col">
                                                                        <label
                                                                            className="table-form-label">Departman:</label>
                                                                        <input
                                                                            type="text"
                                                                            className="table-form-input"
                                                                            value={row.department}
                                                                            onChange={(e) => handleInputChange(e, 'department')}
                                                                        />
                                                                    </div>
                                                                    <div className="table-form-col">
                                                                        <label
                                                                            className="table-form-label">Pozisyon:</label>
                                                                        <input
                                                                            type="text"
                                                                            className="table-form-input"
                                                                            value={row.position}
                                                                            onChange={(e) => handleInputChange(e, 'position')}
                                                                        />
                                                                    </div>
                                                                    <div className="table-form-col">
                                                                        <label
                                                                            className="table-form-label">Maaş:</label>
                                                                        <input
                                                                            type="number"
                                                                            className="table-form-input"
                                                                            value={row.salary}
                                                                            onChange={(e) => handleInputChange(e, 'salary')}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Diğer Bilgiler */}
                                                            <div className="table-form-group">
                                                                <div className="table-form-title">Diğer Bilgiler</div>
                                                                <div className="table-form-row">
                                                                    <div className="table-form-col">
                                                                        <label className="table-form-label">Kan
                                                                            Grubu:</label>
                                                                        <input
                                                                            type="text"
                                                                            className="table-form-input"
                                                                            value={row.bloodType}
                                                                            onChange={(e) => handleInputChange(e, 'bloodType')}
                                                                        />
                                                                    </div>
                                                                    <div className="table-form-col">
                                                                        <label className="table-form-label">Eğitim
                                                                            Seviyesi:</label>
                                                                        <input
                                                                            type="text"
                                                                            className="table-form-input"
                                                                            value={row.educationLevel}
                                                                            onChange={(e) => handleInputChange(e, 'educationLevel')}
                                                                        />
                                                                    </div>
                                                                    <div className="table-form-col">
                                                                        <label className="table-form-label">Vardiya
                                                                            Planı:</label>
                                                                        <input
                                                                            type="text"
                                                                            className="table-form-input"
                                                                            value={row.shiftSchedule}
                                                                            onChange={(e) => handleInputChange(e, 'shiftSchedule')}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <button type="submit" className="table-form-submit">Kaydet
                                                            </button>
                                                        </form>
                                                    ) : (
                                                        <div className={"table-row-detail"}>
                                                            <div className="table-row-detail-item">
                                                                <h4>Personel Bilgileri</h4>
                                                                <div
                                                                    className={`dropdown ${activeDropdown === 'personal' ? 'active' : ''}`}>
                                                                    <div className="dropdown-title"
                                                                         onClick={() => toggleDropdown('personal')}>
                                                                        <FaInfoCircle/>
                                                                        <span>Kişisel Bilgiler</span>
                                                                        <IoIosArrowForward/>
                                                                    </div>
                                                                    <div
                                                                        className={`dropdown-body ${activeDropdown === 'personal' ? 'active' : ''}`}>
                                                                        <div className="dropdown-item">
                                                                            <span
                                                                                style={{fontWeight: "bold"}}>Ad Soyad:</span>
                                                                            {`${row.firstName} ${row.lastName}`}
                                                                        </div>
                                                                        <div className="dropdown-item">
                                                                            <span style={{fontWeight: "bold"}}>TC Kimlik No:</span>
                                                                            {row.identityNumber}
                                                                        </div>
                                                                        <div className="dropdown-item">
                                                                            <span style={{fontWeight: "bold"}}>Doğum Tarihi:</span>
                                                                            {new Date(row.birthDate).toLocaleDateString()}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div
                                                                    className={`dropdown ${activeDropdown === 'contact' ? 'active' : ''}`}>
                                                                    <div className="dropdown-title"
                                                                         onClick={() => toggleDropdown('contact')}>
                                                                        <FaInfoCircle/>
                                                                        <span>İletişim Bilgileri</span>
                                                                        <IoIosArrowForward/>
                                                                    </div>
                                                                    <div
                                                                        className={`dropdown-body ${activeDropdown === 'contact' ? 'active' : ''}`}>
                                                                        <div className="dropdown-item">
                                                                            <span
                                                                                style={{fontWeight: "bold"}}>Telefon:</span>
                                                                            {row.phoneNumber}
                                                                        </div>
                                                                        <div className="dropdown-item">
                                                                            <span
                                                                                style={{fontWeight: "bold"}}>Email:</span>
                                                                            {row.email}
                                                                        </div>
                                                                        <div className="dropdown-item">
                                                                            <span
                                                                                style={{fontWeight: "bold"}}>Adres:</span>
                                                                            {row.address}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div
                                                                    className={`dropdown ${activeDropdown === 'work' ? 'active' : ''}`}>
                                                                    <div className="dropdown-title"
                                                                         onClick={() => toggleDropdown('work')}>
                                                                        <FaInfoCircle/>
                                                                        <span>İş Bilgileri</span>
                                                                        <IoIosArrowForward/>
                                                                    </div>
                                                                    <div
                                                                        className={`dropdown-body ${activeDropdown === 'work' ? 'active' : ''}`}>
                                                                        <div className="dropdown-item">
                                                                            <span
                                                                                style={{fontWeight: "bold"}}>Departman:</span>
                                                                            {row.department}
                                                                        </div>
                                                                        <div className="dropdown-item">
                                                                            <span
                                                                                style={{fontWeight: "bold"}}>Pozisyon:</span>
                                                                            {row.position}
                                                                        </div>
                                                                        <div className="dropdown-item">
                                                                            <span
                                                                                style={{fontWeight: "bold"}}>Maaş:</span>
                                                                            {row.salary}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div
                                                                    className={`dropdown ${activeDropdown === 'other' ? 'active' : ''}`}>
                                                                    <div className="dropdown-title"
                                                                         onClick={() => toggleDropdown('other')}>
                                                                        <FaInfoCircle/>
                                                                        <span>Diğer Bilgiler</span>
                                                                        <IoIosArrowForward/>
                                                                    </div>
                                                                    <div
                                                                        className={`dropdown-body ${activeDropdown === 'other' ? 'active' : ''}`}>
                                                                        <div className="dropdown-item">
                                                                            <span style={{fontWeight: "bold"}}>Kan Grubu:</span>
                                                                            {row.bloodType}
                                                                        </div>
                                                                        <div className="dropdown-item">
                                                                            <span style={{fontWeight: "bold"}}>Eğitim Seviyesi:</span>
                                                                            {row.educationLevel}
                                                                        </div>
                                                                        <div className="dropdown-item">
                                                                            <span style={{fontWeight: "bold"}}>Vardiya Planı:</span>
                                                                            {row.shiftSchedule}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + 1} style={{textAlign: 'center'}}>
                                    Veri bulunamadı
                                </td>
                            </tr>
                        )}
                        </tbody>
                    )}
                </table>

                <div className="pagination" style={{marginTop: '10px', display: 'flex', justifyContent: 'flex-start'}}>
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={"table-pagination-button"}
                    >
                        <MdOutlineArrowBackIosNew/>
                    </button>
                    <span style={{margin: '0 10px'}}>
                        {currentPage} / {Math.ceil(filteredData.length / itemsPerPage)}
                    </span>
                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage * itemsPerPage >= filteredData.length}
                        className={"table-pagination-button"}
                    >
                        <MdOutlineArrowForwardIos/>
                    </button>
                </div>
            </div>
        </div>
    );
});

export default PersonScreen;
