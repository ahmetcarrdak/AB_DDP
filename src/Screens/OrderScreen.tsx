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

const OrderScreen = memo(() => {
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
    const [order, setOrder] = useState({
        orderId: 0,
        orderDate: new Date(),
        customerName: '',
        deliveryAddress: '',
        customerPhone: '',
        customerEmail: '',
        productName: '',
        quantity: 0,
        unitPrice: 0,
        totalAmount: 0,
        orderStatus: '',
        estimatedDeliveryDate: null,
        actualDeliveryDate: null,
        paymentMethod: '',
        isPaid: false,
        paymentStatus: '',
        assignedEmployeeId: null,
        specialInstructions: '',
        priority: '',
        isActive: true,
        cancellationReason: '',
        cancellationDate: null,
        orderSource: '',
        discountAmount: 0,
        taxAmount: 0,
        invoiceNumber: ''
    });

    const toggleDropdown = (dropdown: string) => {
        setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5262/api/Order/all');
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
        {title: 'Sipariş No', data: 'orderId'},
        {title: 'Müşteri', data: 'customerName'},
        {title: 'Ürün', data: 'productName'},
        {title: 'Tutar', data: 'totalAmount'},
        {title: 'Durum', data: 'orderStatus'},
        {title: 'Öncelik', data: 'priority'},
        {title: 'Ödeme Durumu', data: 'paymentStatus'},
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

    const toggleRow = (orderId: number) => {
        setExpandedRow(expandedRow === orderId ? null : orderId);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const value = e.target.type === 'number' ? parseFloat(e.target.value) :
                     e.target.type === 'checkbox' ? e.target.checked :
                     e.target.value;

        setOrder(prevOrder => ({
            ...prevOrder,
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
                            doc.save('siparisler.pdf');
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
                            paginatedData.map((order) => (
                                <React.Fragment key={order.orderId}>
                                    <tr onClick={() => toggleRow(order.orderId)} className={"table-tbody"}>
                                        <td>{order.orderId}</td>
                                        {columns.map((col) => (
                                            <td key={col.data} className={"table-tbody-td"}>
                                                {col.data === 'isActive' ?
                                                    (order[col.data] ? 'Aktif' : 'Pasif') :
                                                    order[col.data]}
                                            </td>
                                        ))}
                                    </tr>

                                    {expandedRow === order.orderId && (
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
                                                                <div className="table-form-title">Sipariş Bilgileri</div>
                                                                <div className="table-form-row">
                                                                    <div className="table-form-col">
                                                                        <label className="table-form-label">Müşteri Adı:</label>
                                                                        <input
                                                                            type="text"
                                                                            className="table-form-input"
                                                                            value={order.customerName}
                                                                            onChange={(e) => handleInputChange(e, 'customerName')}
                                                                        />
                                                                    </div>
                                                                    <div className="table-form-col">
                                                                        <label className="table-form-label">Ürün Adı:</label>
                                                                        <input
                                                                            type="text"
                                                                            className="table-form-input"
                                                                            value={order.productName}
                                                                            onChange={(e) => handleInputChange(e, 'productName')}
                                                                        />
                                                                    </div>
                                                                    <div className="table-form-col">
                                                                        <label className="table-form-label">Miktar:</label>
                                                                        <input
                                                                            type="number"
                                                                            className="table-form-input"
                                                                            value={order.quantity}
                                                                            onChange={(e) => handleInputChange(e, 'quantity')}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="table-form-group">
                                                                <div className="table-form-title">İletişim Bilgileri</div>
                                                                <div className="table-form-row">
                                                                    <div className="table-form-col">
                                                                        <label className="table-form-label">Telefon:</label>
                                                                        <input
                                                                            type="text"
                                                                            className="table-form-input"
                                                                            value={order.customerPhone}
                                                                            onChange={(e) => handleInputChange(e, 'customerPhone')}
                                                                        />
                                                                    </div>
                                                                    <div className="table-form-col">
                                                                        <label className="table-form-label">Email:</label>
                                                                        <input
                                                                            type="email"
                                                                            className="table-form-input"
                                                                            value={order.customerEmail}
                                                                            onChange={(e) => handleInputChange(e, 'customerEmail')}
                                                                        />
                                                                    </div>
                                                                    <div className="table-form-col">
                                                                        <label className="table-form-label">Adres:</label>
                                                                        <input
                                                                            type="text"
                                                                            className="table-form-input"
                                                                            value={order.deliveryAddress}
                                                                            onChange={(e) => handleInputChange(e, 'deliveryAddress')}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="table-form-group">
                                                                <div className="table-form-title">Ödeme Bilgileri</div>
                                                                <div className="table-form-row">
                                                                    <div className="table-form-col">
                                                                        <label className="table-form-label">Ödeme Yöntemi:</label>
                                                                        <input
                                                                            type="text"
                                                                            className="table-form-input"
                                                                            value={order.paymentMethod}
                                                                            onChange={(e) => handleInputChange(e, 'paymentMethod')}
                                                                        />
                                                                    </div>
                                                                    <div className="table-form-col">
                                                                        <label className="table-form-label">Ödeme Durumu:</label>
                                                                        <input
                                                                            type="text"
                                                                            className="table-form-input"
                                                                            value={order.paymentStatus}
                                                                            onChange={(e) => handleInputChange(e, 'paymentStatus')}
                                                                        />
                                                                    </div>
                                                                    <div className="table-form-col">
                                                                        <label className="table-form-label">Fatura No:</label>
                                                                        <input
                                                                            type="text"
                                                                            className="table-form-input"
                                                                            value={order.invoiceNumber}
                                                                            onChange={(e) => handleInputChange(e, 'invoiceNumber')}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <button type="submit" className="table-form-submit">Kaydet</button>
                                                        </form>
                                                    ) : (
                                                        <div className={"table-row-detail"}>
                                                            <div className="table-row-detail-item">
                                                                <h4>Sipariş Detayları</h4>
                                                                <div className={`dropdown ${activeDropdown === 'order' ? 'active' : ''}`}>
                                                                    <div className="dropdown-title" onClick={() => toggleDropdown('order')}>
                                                                        <FaInfoCircle/>
                                                                        <span>Sipariş Bilgileri</span>
                                                                        <IoIosArrowForward/>
                                                                    </div>
                                                                    <div className={`dropdown-body ${activeDropdown === 'order' ? 'active' : ''}`}>
                                                                        <div className="dropdown-item">
                                                                            <span style={{fontWeight: "bold"}}>Sipariş No:</span>
                                                                            {order.orderId}
                                                                        </div>
                                                                        <div className="dropdown-item">
                                                                            <span style={{fontWeight: "bold"}}>Sipariş Tarihi:</span>
                                                                            {new Date(order.orderDate).toLocaleDateString()}
                                                                        </div>
                                                                        <div className="dropdown-item">
                                                                            <span style={{fontWeight: "bold"}}>Durum:</span>
                                                                            {order.orderStatus}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className={`dropdown ${activeDropdown === 'customer' ? 'active' : ''}`}>
                                                                    <div className="dropdown-title" onClick={() => toggleDropdown('customer')}>
                                                                        <FaInfoCircle/>
                                                                        <span>Müşteri Bilgileri</span>
                                                                        <IoIosArrowForward/>
                                                                    </div>
                                                                    <div className={`dropdown-body ${activeDropdown === 'customer' ? 'active' : ''}`}>
                                                                        <div className="dropdown-item">
                                                                            <span style={{fontWeight: "bold"}}>Müşteri:</span>
                                                                            {order.customerName}
                                                                        </div>
                                                                        <div className="dropdown-item">
                                                                            <span style={{fontWeight: "bold"}}>Telefon:</span>
                                                                            {order.customerPhone}
                                                                        </div>
                                                                        <div className="dropdown-item">
                                                                            <span style={{fontWeight: "bold"}}>Email:</span>
                                                                            {order.customerEmail}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className={`dropdown ${activeDropdown === 'payment' ? 'active' : ''}`}>
                                                                    <div className="dropdown-title" onClick={() => toggleDropdown('payment')}>
                                                                        <FaInfoCircle/>
                                                                        <span>Ödeme Bilgileri</span>
                                                                        <IoIosArrowForward/>
                                                                    </div>
                                                                    <div className={`dropdown-body ${activeDropdown === 'payment' ? 'active' : ''}`}>
                                                                        <div className="dropdown-item">
                                                                            <span style={{fontWeight: "bold"}}>Toplam Tutar:</span>
                                                                            {order.totalAmount}
                                                                        </div>
                                                                        <div className="dropdown-item">
                                                                            <span style={{fontWeight: "bold"}}>Ödeme Yöntemi:</span>
                                                                            {order.paymentMethod}
                                                                        </div>
                                                                        <div className="dropdown-item">
                                                                            <span style={{fontWeight: "bold"}}>Ödeme Durumu:</span>
                                                                            {order.paymentStatus}
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

export default OrderScreen;
