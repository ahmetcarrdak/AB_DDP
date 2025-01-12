import React, {memo, useEffect, useState} from 'react';
import axios from 'axios';
import HeaderComponent from '../Components/HeaderComponent';
import {jsPDF} from 'jspdf';
import 'jspdf-autotable';
import {FaInfoCircle} from 'react-icons/fa';
import {MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos} from "react-icons/md";
import {IoIosArrowForward} from "react-icons/io";

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

const WorkScreen = memo(() => {
    const [data, setData] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [query, setQuery] = useState('');
    const [sortColumn, setSortColumn] = useState('');
    const [sortAscending, setSortAscending] = useState(true);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [work, setWork] = useState({
        workName: '',
        description: '',
        createdDate: new Date(),
        startDate: null,
        dueDate: null,
        completionDate: null,
        status: '',
        priority: '',
        assignedDepartmentId: 0,
        assignedEmployeeId: null,
        createdByEmployeeId: 0,
        location: '',
        estimatedCost: 0,
        actualCost: 0,
        estimatedDuration: 0,
        actualDuration: 0,
        requiredEquipment: '',
        requiredMaterials: '',
        workType: '',
        isRecurring: false,
        recurrencePattern: '',
        requiresApproval: false,
        approvedByEmployeeId: null,
        approvalDate: null,
        notes: '',
        isActive: true,
        cancellationReason: '',
        cancellationDate: null,
        qualityScore: null,
        qualityNotes: '',
        hasSafetyRisks: false,
        safetyNotes: ''
    });

    const toggleDropdown = (dropdown: string) => {
        setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5262/api/Work/all');
                setData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const columns = [
        {title: 'İş Adı', data: 'workName'},
        {title: 'Durum', data: 'status'},
        {title: 'Öncelik', data: 'priority'},
        {title: 'Başlama Tarihi', data: 'startDate'},
        {title: 'Bitiş Tarihi', data: 'dueDate'},
        {title: 'Departman', data: 'assignedDepartmentId'},
        {title: 'Tip', data: 'workType'},
        {title: 'Aktif', data: 'isActive'}
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

    const toggleRow = (workId: number) => {
        setExpandedRow(expandedRow === workId ? null : workId);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const value = e.target.type === 'number' ? parseFloat(e.target.value) :
                     e.target.type === 'checkbox' ? e.target.checked :
                     e.target.value;

        setWork(prevWork => ({
            ...prevWork,
            [field]: value
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
                        onClick={() => {
                            const doc = new jsPDF();
                            const tableColumn = columns.map(col => col.title);
                            const tableRows = paginatedData.map(row =>
                                columns.map(col => row[col.data])
                            );
                            //@ts-ignore
                            doc.autoTable(tableColumn, tableRows);
                            doc.save('isler.pdf');
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
                            {columns.map(column => (
                                <th
                                    key={column.data}
                                    onClick={() => handleSort(column.data)}
                                    className={"table-thead-th"}
                                >
                                    {column.title} {sortColumn === column.data && (sortAscending ? '↑' : '↓')}
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
                                    <React.Fragment key={work.id}>
                                        <tr onClick={() => toggleRow(work.id)} className={"table-tbody"}>
                                            <td>{work.id}</td>
                                            {columns.map((col) => (
                                                <td key={col.data} className={"table-tbody-td"}>
                                                    {col.data === 'isActive' ?
                                                        (work[col.data] ? 'Aktif' : 'Pasif') :
                                                        work[col.data]}
                                                </td>
                                            ))}
                                        </tr>

                                        {expandedRow === work.id && (
                                            <tr>
                                                <td colSpan={columns.length + 1}>
                                                    <div className="table-detail-container">
                                                        <div className="detail-section">
                                                            <div className={`checkbox ${editMode && 'active'}`}
                                                                 onClick={() => setEditMode(!editMode)}>
                                                                <div className={`checkbox-box ${editMode && 'active'}`}></div>
                                                            </div>
                                                            <span style={{marginLeft: 20}}></span>
                                                            Düzenleme Modu {editMode ? ('Aktif') : ('Aktifleştirin')}
                                                        </div>

                                                        {editMode ? (
                                                            <form className="table-form">
                                                                <div className="table-form-group">
                                                                    <div className="table-form-title">İş Bilgileri</div>
                                                                    <div className="table-form-row">
                                                                        <div className="table-form-col">
                                                                            <label className="table-form-label">İş Adı:</label>
                                                                            <input
                                                                                type="text"
                                                                                className="table-form-input"
                                                                                value={work.workName}
                                                                                onChange={(e) => handleInputChange(e, 'workName')}
                                                                            />
                                                                        </div>
                                                                        <div className="table-form-col">
                                                                            <label className="table-form-label">Durum:</label>
                                                                            <input
                                                                                type="text"
                                                                                className="table-form-input"
                                                                                value={work.status}
                                                                                onChange={(e) => handleInputChange(e, 'status')}
                                                                            />
                                                                        </div>
                                                                        <div className="table-form-col">
                                                                            <label className="table-form-label">Öncelik:</label>
                                                                            <input
                                                                                type="text"
                                                                                className="table-form-input"
                                                                                value={work.priority}
                                                                                onChange={(e) => handleInputChange(e, 'priority')}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="table-form-group">
                                                                    <div className="table-form-title">Tarih Bilgileri</div>
                                                                    <div className="table-form-row">
                                                                        <div className="table-form-col">
                                                                            <label className="table-form-label">Başlama Tarihi:</label>
                                                                            <input
                                                                                type="date"
                                                                                className="table-form-input"
                                                                                value={work.startDate}
                                                                                onChange={(e) => handleInputChange(e, 'startDate')}
                                                                            />
                                                                        </div>
                                                                        <div className="table-form-col">
                                                                            <label className="table-form-label">Bitiş Tarihi:</label>
                                                                            <input
                                                                                type="date"
                                                                                className="table-form-input"
                                                                                value={work.dueDate}
                                                                                onChange={(e) => handleInputChange(e, 'dueDate')}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <button type="submit" className="table-form-submit">Kaydet</button>
                                                            </form>
                                                        ) : (
                                                            <div className={"table-row-detail"}>
                                                                <div className="table-row-detail-item">
                                                                    <h4>İş Detayları</h4>
                                                                    <div className={`dropdown ${activeDropdown === 'workInfo' ? 'active' : ''}`}>
                                                                        <div className="dropdown-title" onClick={() => toggleDropdown('workInfo')}>
                                                                            <FaInfoCircle/>
                                                                            <span>İş Bilgileri</span>
                                                                            <IoIosArrowForward/>
                                                                        </div>
                                                                        <div className={`dropdown-body ${activeDropdown === 'workInfo' ? 'active' : ''}`}>
                                                                            <div className="dropdown-item">
                                                                                <span style={{fontWeight: "bold"}}>İş Adı:</span>
                                                                                {work.workName}
                                                                            </div>
                                                                            <div className="dropdown-item">
                                                                                <span style={{fontWeight: "bold"}}>Durum:</span>
                                                                                {work.status}
                                                                            </div>
                                                                            <div className="dropdown-item">
                                                                                <span style={{fontWeight: "bold"}}>Öncelik:</span>
                                                                                {work.priority}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className={`dropdown ${activeDropdown === 'dates' ? 'active' : ''}`}>
                                                                        <div className="dropdown-title" onClick={() => toggleDropdown('dates')}>
                                                                            <FaInfoCircle/>
                                                                            <span>Tarih Bilgileri</span>
                                                                            <IoIosArrowForward/>
                                                                        </div>
                                                                        <div className={`dropdown-body ${activeDropdown === 'dates' ? 'active' : ''}`}>
                                                                            <div className="dropdown-item">
                                                                                <span style={{fontWeight: "bold"}}>Başlama Tarihi:</span>
                                                                                {work.startDate}
                                                                            </div>
                                                                            <div className="dropdown-item">
                                                                                <span style={{fontWeight: "bold"}}>Bitiş Tarihi:</span>
                                                                                {work.dueDate}
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

export default WorkScreen;
