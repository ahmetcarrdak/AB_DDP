import React, {memo, useEffect, useState} from 'react';
import axios from 'axios';
import HeaderComponent from '../Components/HeaderComponent';
import {jsPDF} from 'jspdf';
import 'jspdf-autotable';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import {FaInfoCircle, FaCalendarAlt} from 'react-icons/fa';
import {MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos} from "react-icons/md";
import {CiDiscount1} from "react-icons/ci";
import {GrInfo} from "react-icons/gr";
import {IoIosAlbums, IoIosArrowForward, IoIosCheckmark} from "react-icons/io";
import {LiaTimesSolid} from "react-icons/lia";

// Veriyi sayfalama işlemi
const paginateData = (data: any[], currentPage: number, itemsPerPage: number) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
};

// Veriyi sıralama işlemi
const sortData = (data: any[], column: string, ascending: boolean) => {
    return data.sort((a, b) => {
        if (a[column] < b[column]) return ascending ? -1 : 1;
        if (a[column] > b[column]) return ascending ? 1 : -1;
        return 0;
    });
};

// Veriyi filtreleme işlemi
const filterData = (data: any[], query: string) => {
    if (!query) return data;
    return data.filter((row) => {
        return Object.values(row).some((value) =>
            String(value).toLowerCase().includes(query.toLowerCase())
        );
    });
};

const StoreScreen = memo(() => {
    const [data, setData] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [query, setQuery] = useState('');
    const [sortColumn, setSortColumn] = useState('');
    const [sortAscending, setSortAscending] = useState(true);
    const [expandedRow, setExpandedRow] = useState<number | null>(null); // Satır detayları için durum
    const [editMode, setEditMode] = useState(false); // Düzenleme modu için durum
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [row, setRow] = useState({
        purchaseDate: '',
        expiryDate: '',
        lastInventoryDate: '',
        quantity: 0,
        unitPrice: 0,
        weight: 0,
        minimumStockLevel: 0,
        maximumStockLevel: 0,
        name: '',
        barcode: '',
        serialNumber: '',
        unit: '',
        dimensions: '',
        description: '',
        category: '',
        supplierInfo: '',
        location: '',
        storageConditions: ''
    });

    const toggleDropdown = (dropdown: string) => {
        setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
    };
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5262/api/Store/all');
                setData(response.data);
                console.log('Veriler:', response.data);
            } catch (error) {
                console.error('Verileri çekerken bir hata oluştu:', error);
            }
        };
        fetchData();
    }, []);

    const columns = [
        {title: 'Adı', data: 'name'},
        {title: 'Stokta', data: 'quantity'},
        {title: 'Birim', data: 'unit'},
        {title: 'Birim Fiyatı', data: 'unitPrice'},
        {title: 'Tedarikçi Bilgisi', data: 'supplierInfo'},
        {title: 'Barkod', data: 'barcode'},
        {title: 'Seri Numarası', data: 'serialNumber'},
        {title: 'Ağırlık', data: 'weight'},
        {title: 'Boyutlar', data: 'dimensions'},
        {title: 'Son Envanter Tarihi', data: 'lastInventoryDate'},
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

    const toggleRow = (storeId: number) => {
        setExpandedRow(expandedRow === storeId ? null : storeId); // Satır detaylarını aç/kapat
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        const tableColumn = columns.map(col => col.title);
        const tableRows = paginatedData.map(row =>
            columns.map(col => row[col.data])
        );
        //@ts-ignore
        doc.autoTable(tableColumn, tableRows);
        doc.save('tablo.pdf');
    };

    // Stok durumu grafiği için renk belirleme
    const StockStatusChart = ({quantity, upperLimit, lowerLimit}: any) => {
        let fillColor = '#8884d8'; // Varsayılan renk

        if (quantity > upperLimit) {
            fillColor = '#40E0D0'; // Turkuaz, üst limitin üzerinde
        } else if (quantity < lowerLimit) {
            fillColor = '#FF6347'; // Kırmızı, alt limitin altında
        } else {
            fillColor = '#9370DB'; // Morumsu, limitsel aralıkta
        }

        // YAxis için domain aralığını dinamik olarak hesaplayalım
        const minValue = 0; //Math.min(quantity, lowerLimit);
        const maxValue = Math.max(quantity, upperLimit);

        // Grafik için yeni domain aralığını belirleyelim
        const yAxisDomain = [minValue - (minValue * 0.1), maxValue + (maxValue * 0.1)]; // %10'luk bir aralık ekleyerek genişletiyoruz

        return (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[{name: 'Stok', quantity}]}>
                    <XAxis dataKey="name"/>
                    <YAxis domain={yAxisDomain}/> {/* Dinamik domain */}
                    <Tooltip/>
                    <Bar dataKey="quantity" fill={fillColor}/>
                </BarChart>
            </ResponsiveContainer>
        );
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;

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
                    <tbody>
                    {paginatedData.length > 0 ? (
                        paginatedData.map((row, index) => (
                            <React.Fragment key={row.storeId}>
                                <tr onClick={() => toggleRow(row.storeId)} className={"table-tbody"}>
                                    <td>{row.storeId}</td>
                                    {columns.map((col) => (
                                        <td key={col.data} className={"table-tbody-td"}>
                                            {row[col.data]}
                                        </td>
                                    ))}
                                </tr>

                                {expandedRow === row.storeId && (
                                    <tr>
                                        <td colSpan={columns.length}>
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
                                                        {/* Satın Alma Bilgileri */}
                                                        <div className="table-form-group">
                                                            <div className="table-form-title">Satın Alma Bilgileri</div>
                                                            <div className="table-form-row">
                                                                <div className="table-form-col">
                                                                    <label className="table-form-label"
                                                                           htmlFor="purchaseDate">Satın Alma
                                                                        Tarihi:</label>
                                                                    <input
                                                                        type="date"
                                                                        id="purchaseDate"
                                                                        className="table-form-input"
                                                                        value={`${row.purchaseDate ? new Date(row.purchaseDate).toISOString().split('T')[0] : ''}`}
                                                                        onChange={(e) => handleInputChange(e, 'purchaseDate')}
                                                                    />
                                                                </div>
                                                                <div className="table-form-col">
                                                                    <label className="table-form-label"
                                                                           htmlFor="expiryDate">Son Kullanma
                                                                        Tarihi:</label>
                                                                    <input
                                                                        type="date"
                                                                        id="expiryDate"
                                                                        className="table-form-input"
                                                                        value={`${row.expiryDate ? new Date(row.expiryDate).toISOString().split('T')[0] : ''}`}
                                                                        onChange={(e) => handleInputChange(e, 'expiryDate')}
                                                                    />
                                                                </div>
                                                                <div className="table-form-col">
                                                                    <label className="table-form-label"
                                                                           htmlFor="lastInventoryDate">Son Envanter
                                                                        Tarihi:</label>
                                                                    <input
                                                                        type="date"
                                                                        id="lastInventoryDate"
                                                                        className="table-form-input"
                                                                        value={`${row.lastInventoryDate ? new Date(row.lastInventoryDate).toISOString().split('T')[0] : ''}`}
                                                                        onChange={(e) => handleInputChange(e, 'lastInventoryDate')}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Sayısal Değerler */}
                                                        <div className="table-form-group">
                                                            <div className="table-form-title">Sayısal Değerler</div>
                                                            <div className="table-form-row">
                                                                <div className="table-form-col">
                                                                    <label className="table-form-label"
                                                                           htmlFor="quantity">Stok Miktarı:</label>
                                                                    <input
                                                                        type="number"
                                                                        id="quantity"
                                                                        className="table-form-input"
                                                                        value={row.quantity || ''}
                                                                        onChange={(e) => handleInputChange(e, 'quantity')}
                                                                    />
                                                                </div>
                                                                <div className="table-form-col">
                                                                    <label className="table-form-label"
                                                                           htmlFor="unitPrice">Birim Fiyatı:</label>
                                                                    <input
                                                                        type="number"
                                                                        id="unitPrice"
                                                                        className="table-form-input"
                                                                        value={row.unitPrice || ''}
                                                                        onChange={(e) => handleInputChange(e, 'unitPrice')}
                                                                    />
                                                                </div>
                                                                <div className="table-form-col">
                                                                    <label className="table-form-label"
                                                                           htmlFor="weight">Ağırlık:</label>
                                                                    <input
                                                                        type="number"
                                                                        id="weight"
                                                                        className="table-form-input"
                                                                        value={row.weight || ''}
                                                                        onChange={(e) => handleInputChange(e, 'weight')}
                                                                    />
                                                                </div>
                                                                <div className="table-form-col">
                                                                    <label className="table-form-label"
                                                                           htmlFor="minimumStockLevel">Minimum Stok
                                                                        Seviyesi:</label>
                                                                    <input
                                                                        type="number"
                                                                        id="minimumStockLevel"
                                                                        className="table-form-input"
                                                                        value={row.minimumStockLevel || ''}
                                                                        onChange={(e) => handleInputChange(e, 'minimumStockLevel')}
                                                                    />
                                                                </div>
                                                                <div className="table-form-col">
                                                                    <label className="table-form-label"
                                                                           htmlFor="maximumStockLevel">Maksimum Stok
                                                                        Seviyesi:</label>
                                                                    <input
                                                                        type="number"
                                                                        id="maximumStockLevel"
                                                                        className="table-form-input"
                                                                        value={row.maximumStockLevel || ''}
                                                                        onChange={(e) => handleInputChange(e, 'maximumStockLevel')}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Tanımlayıcı Bilgiler */}
                                                        <div className="table-form-group">
                                                            <div className="table-form-title">Tanımlayıcı Bilgiler</div>
                                                            <div className="table-form-row">
                                                                <div className="table-form-col">
                                                                    <label className="table-form-label" htmlFor="name">Ürün
                                                                        Adı:</label>
                                                                    <input
                                                                        type="text"
                                                                        id="name"
                                                                        className="table-form-input"
                                                                        value={row.name || ''}
                                                                        onChange={(e) => handleInputChange(e, 'name')}
                                                                    />
                                                                </div>
                                                                <div className="table-form-col">
                                                                    <label className="table-form-label"
                                                                           htmlFor="barcode">Barkod:</label>
                                                                    <input
                                                                        type="text"
                                                                        id="barcode"
                                                                        className="table-form-input"
                                                                        value={row.barcode || ''}
                                                                        onChange={(e) => handleInputChange(e, 'barcode')}
                                                                    />
                                                                </div>
                                                                <div className="table-form-col">
                                                                    <label className="table-form-label"
                                                                           htmlFor="serialNumber">Seri Numarası:</label>
                                                                    <input
                                                                        type="text"
                                                                        id="serialNumber"
                                                                        className="table-form-input"
                                                                        value={row.serialNumber || ''}
                                                                        onChange={(e) => handleInputChange(e, 'serialNumber')}
                                                                    />
                                                                </div>
                                                                <div className="table-form-col">
                                                                    <label className="table-form-label"
                                                                           htmlFor="unit">Birim:</label>
                                                                    <input
                                                                        type="text"
                                                                        id="unit"
                                                                        className="table-form-input"
                                                                        value={row.unit || ''}
                                                                        onChange={(e) => handleInputChange(e, 'unit')}
                                                                    />
                                                                </div>
                                                                <div className="table-form-col">
                                                                    <label className="table-form-label"
                                                                           htmlFor="dimensions">Boyutlar:</label>
                                                                    <input
                                                                        type="text"
                                                                        id="dimensions"
                                                                        className="table-form-input"
                                                                        value={row.dimensions || ''}
                                                                        onChange={(e) => handleInputChange(e, 'dimensions')}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Diğer Bilgiler */}
                                                        <div className="table-form-group">
                                                            <div className="table-form-title">Diğer Bilgiler</div>
                                                            <div className="table-form-row">
                                                                <div className="table-form-col">
                                                                    <label className="table-form-label"
                                                                           htmlFor="description">Açıklama:</label>
                                                                    <input
                                                                        type="text"
                                                                        id="description"
                                                                        className="table-form-input"
                                                                        value={row.description || ''}
                                                                        onChange={(e) => handleInputChange(e, 'description')}
                                                                    />
                                                                </div>
                                                                <div className="table-form-col">
                                                                    <label className="table-form-label"
                                                                           htmlFor="category">Kategori:</label>
                                                                    <input
                                                                        type="text"
                                                                        id="category"
                                                                        className="table-form-input"
                                                                        value={row.category || ''}
                                                                        onChange={(e) => handleInputChange(e, 'category')}
                                                                    />
                                                                </div>
                                                                <div className="table-form-col">
                                                                    <label className="table-form-label"
                                                                           htmlFor="supplierInfo">Tedarikçi
                                                                        Bilgisi:</label>
                                                                    <input
                                                                        type="text"
                                                                        id="supplierInfo"
                                                                        className="table-form-input"
                                                                        value={row.supplierInfo || ''}
                                                                        onChange={(e) => handleInputChange(e, 'supplierInfo')}
                                                                    />
                                                                </div>
                                                                <div className="table-form-col">
                                                                    <label className="table-form-label"
                                                                           htmlFor="location">Depo Konumu:</label>
                                                                    <input
                                                                        type="text"
                                                                        id="location"
                                                                        className="table-form-input"
                                                                        value={row.location || ''}
                                                                        onChange={(e) => handleInputChange(e, 'location')}
                                                                    />
                                                                </div>
                                                                <div className="table-form-col">
                                                                    <label className="table-form-label"
                                                                           htmlFor="storageConditions">Depo
                                                                        Koşulları:</label>
                                                                    <input
                                                                        type="text"
                                                                        id="storageConditions"
                                                                        className="table-form-input"
                                                                        value={row.storageConditions || ''}
                                                                        onChange={(e) => handleInputChange(e, 'storageConditions')}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Kaydet Butonu */}
                                                        <button type="submit" className="table-form-submit">Kaydet
                                                        </button>
                                                    </form>


                                                ) : (
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
                                                                className={`dropdown ${activeDropdown === 'dates' ? 'active' : ''}`}>
                                                                <div className="dropdown-title"
                                                                     onClick={() => toggleDropdown('dates')}>
                                                                    <FaCalendarAlt/>
                                                                    <span>Tarihler</span>
                                                                    <IoIosArrowForward/>
                                                                </div>
                                                                <div
                                                                    className={`dropdown-body ${activeDropdown === 'dates' ? 'active' : ''}`}>
                                                                    <div className="dropdown-item">
                                                                        <span
                                                                            style={{fontWeight: "bold"}}>Satın alma tarihi:</span>
                                                                        {new Date(row.purchaseDate).toLocaleDateString()}
                                                                        {row.purchaseDate ? (
                                                                            <span
                                                                                style={{color: '#83f333'}}><IoIosCheckmark/></span>
                                                                        ) : (
                                                                            <span
                                                                                style={{color: '#d51883'}}><LiaTimesSolid/></span>
                                                                        )}
                                                                    </div>
                                                                    <div className="dropdown-item">
                                                                        <span
                                                                            style={{fontWeight: "bold"}}>Son kullanma tarihi:</span>
                                                                        {row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : 'Girilmemiş'}
                                                                        {row.expiryDate ? (
                                                                            <span
                                                                                style={{color: '#83f333'}}><IoIosCheckmark/></span>
                                                                        ) : (
                                                                            <span
                                                                                style={{color: '#d51883'}}><LiaTimesSolid/></span>
                                                                        )}
                                                                    </div>
                                                                    <div className="dropdown-item">
                                                                        <span
                                                                            style={{fontWeight: "bold"}}>Son envanter tarihi:</span>

                                                                        {new Date(row.lastInventoryDate).toLocaleDateString()}
                                                                        {row.lastInventoryDate ? (
                                                                            <span
                                                                                style={{color: '#83f333'}}><IoIosCheckmark/></span>
                                                                        ) : (
                                                                            <span
                                                                                style={{color: '#d51883'}}><LiaTimesSolid/></span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                            </div>

                                                            {/* Sayısal Değerler */}
                                                            <div
                                                                className={`dropdown ${activeDropdown === 'numbers' ? 'active' : ''}`}>
                                                                <div className="dropdown-title"
                                                                     onClick={() => toggleDropdown('numbers')}>
                                                                    <CiDiscount1/>
                                                                    <span>Sayısal Değerler</span>
                                                                    <IoIosArrowForward/>
                                                                </div>
                                                                <div
                                                                    className={`dropdown-body ${activeDropdown === 'numbers' ? 'active' : ''}`}>
                                                                    <div className="dropdown-item">
                                                                        <span
                                                                            style={{fontWeight: "bold"}}>Stok miktarı:</span>
                                                                        {row.quantity}
                                                                        {row.quantity !== null && row.quantity !== undefined ? (
                                                                            <span
                                                                                style={{color: '#83f333'}}><IoIosCheckmark/></span>
                                                                        ) : (
                                                                            <span
                                                                                style={{color: '#d51883'}}><LiaTimesSolid/></span>
                                                                        )}
                                                                    </div>
                                                                    <div className="dropdown-item">
                                                                        <span
                                                                            style={{fontWeight: "bold"}}>Birim fiyatı:</span>
                                                                        {row.unitPrice.toFixed(2)} ₺
                                                                        {row.unitPrice ? (
                                                                            <span
                                                                                style={{color: '#83f333'}}><IoIosCheckmark/></span>
                                                                        ) : (
                                                                            <span
                                                                                style={{color: '#d51883'}}><LiaTimesSolid/></span>
                                                                        )}
                                                                    </div>
                                                                    <div className="dropdown-item">
                                                                        <span
                                                                            style={{fontWeight: "bold"}}>Ağırlık:</span>
                                                                        {row.weight} kg
                                                                        {row.weight ? (
                                                                            <span
                                                                                style={{color: '#83f333'}}><IoIosCheckmark/></span>
                                                                        ) : (
                                                                            <span
                                                                                style={{color: '#d51883'}}><LiaTimesSolid/></span>
                                                                        )}
                                                                    </div>
                                                                    <div className="dropdown-item">
                                                                        <span
                                                                            style={{fontWeight: "bold"}}>Minimum stok seviyesi:</span>
                                                                        {row.minimumStockLevel}
                                                                        {row.minimumStockLevel ? (
                                                                            <span
                                                                                style={{color: '#83f333'}}><IoIosCheckmark/></span>
                                                                        ) : (
                                                                            <span
                                                                                style={{color: '#d51883'}}><LiaTimesSolid/></span>
                                                                        )}
                                                                    </div>
                                                                    <div className="dropdown-item">
                                                                   <span
                                                                       style={{fontWeight: "bold"}}>Maksimum stok seviyesi:</span>
                                                                        {row.maximumStockLevel}
                                                                        {row.maximumStockLevel ? (
                                                                            <span
                                                                                style={{color: '#83f333'}}><IoIosCheckmark/></span>
                                                                        ) : (
                                                                            <span
                                                                                style={{color: '#d51883'}}><LiaTimesSolid/></span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>


                                                            {/* Tanımlayıcı Bilgiler */}
                                                            <div
                                                                className={`dropdown ${activeDropdown === 'identifiers' ? 'active' : ''}`}>
                                                                <div className="dropdown-title"
                                                                     onClick={() => toggleDropdown('identifiers')}>
                                                                    <GrInfo/>
                                                                    <span>Tanımlayıcı Bilgiler</span>
                                                                    <IoIosArrowForward/>
                                                                </div>
                                                                <div
                                                                    className={`dropdown-body ${activeDropdown === 'identifiers' ? 'active' : ''}`}>
                                                                    <div className="dropdown-item">
                                                                        <span
                                                                            style={{fontWeight: "bold"}}>Ürün Adı:</span>
                                                                        {row.name || 'Girilmemiş'}
                                                                        {row.name ? (
                                                                            <span
                                                                                style={{color: '#83f333'}}><IoIosCheckmark/></span>
                                                                        ) : (
                                                                            <span
                                                                                style={{color: '#d51883'}}><LiaTimesSolid/></span>
                                                                        )}
                                                                    </div>
                                                                    <div className="dropdown-item">
                                                                        <span
                                                                            style={{fontWeight: "bold"}}>Barkod:</span>
                                                                        {row.barcode || 'Girilmemiş'}
                                                                        {row.barcode ? (
                                                                            <span
                                                                                style={{color: '#83f333'}}><IoIosCheckmark/></span>
                                                                        ) : (
                                                                            <span
                                                                                style={{color: '#d51883'}}><LiaTimesSolid/></span>
                                                                        )}
                                                                    </div>
                                                                    <div className="dropdown-item">
                                                                    <span
                                                                        style={{fontWeight: "bold"}}>Seri numarası:</span>
                                                                        {row.serialNumber || 'Girilmemiş'}
                                                                        {row.serialNumber ? (
                                                                            <span
                                                                                style={{color: '#83f333'}}><IoIosCheckmark/></span>
                                                                        ) : (
                                                                            <span
                                                                                style={{color: '#d51883'}}><LiaTimesSolid/></span>
                                                                        )}
                                                                    </div>
                                                                    <div className="dropdown-item">
                                                                   <span
                                                                       style={{fontWeight: "bold"}}>Birim:</span>
                                                                        {row.unit || 'Girilmemiş'}
                                                                        {row.unit ? (
                                                                            <span
                                                                                style={{color: '#83f333'}}><IoIosCheckmark/></span>
                                                                        ) : (
                                                                            <span
                                                                                style={{color: '#d51883'}}><LiaTimesSolid/></span>
                                                                        )}
                                                                    </div>
                                                                    <div className="dropdown-item">
                                                                    <span
                                                                        style={{fontWeight: "bold"}}>Boyutlar:</span> {row.dimensions || 'Girilmemiş'}
                                                                        {row.dimensions ? (
                                                                            <span
                                                                                style={{color: '#83f333'}}><IoIosCheckmark/></span>
                                                                        ) : (
                                                                            <span
                                                                                style={{color: '#d51883'}}><LiaTimesSolid/></span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Diğer Bilgiler */}
                                                            <div
                                                                className={`dropdown ${activeDropdown === 'others' ? 'active' : ''}`}>
                                                                <div className="dropdown-title"
                                                                     onClick={() => toggleDropdown('others')}>
                                                                    <IoIosAlbums/>
                                                                    <span>Diğer Bilgiler</span>
                                                                    <IoIosArrowForward/>
                                                                </div>
                                                                <div
                                                                    className={`dropdown-body ${activeDropdown === 'others' ? 'active' : ''}`}>
                                                                    <div className="dropdown-item">
                                                                        <span
                                                                            style={{fontWeight: "bold"}}>Açıklama:</span> {row.description || 'Girilmemiş'}
                                                                        {row.description ? (
                                                                            <span
                                                                                style={{color: '#83f333'}}><IoIosCheckmark/></span>
                                                                        ) : (
                                                                            <span
                                                                                style={{color: '#d51883'}}><LiaTimesSolid/></span>
                                                                        )}
                                                                    </div>
                                                                    <div className="dropdown-item">
                                                                    <span
                                                                        style={{fontWeight: "bold"}}>Kategori:</span> {row.category || 'Girilmemiş'}
                                                                        {row.category ? (
                                                                            <span
                                                                                style={{color: '#83f333'}}><IoIosCheckmark/></span>
                                                                        ) : (
                                                                            <span
                                                                                style={{color: '#d51883'}}><LiaTimesSolid/></span>
                                                                        )}
                                                                    </div>
                                                                    <div className="dropdown-item">
                                                                    <span
                                                                        style={{fontWeight: "bold"}}>Tedarikçi bilgisi:</span> {row.supplierInfo || 'Girilmemiş'}
                                                                        {row.supplierInfo ? (
                                                                            <span
                                                                                style={{color: '#83f333'}}><IoIosCheckmark/></span>
                                                                        ) : (
                                                                            <span
                                                                                style={{color: '#d51883'}}><LiaTimesSolid/></span>
                                                                        )}
                                                                    </div>
                                                                    <div className="dropdown-item">
                                                                    <span
                                                                        style={{fontWeight: "bold"}}>Depo konumu:</span>
                                                                        {row.location || 'Girilmemiş'}
                                                                        {row.location ? (
                                                                            <span
                                                                                style={{color: '#83f333'}}><IoIosCheckmark/></span>
                                                                        ) : (
                                                                            <span
                                                                                style={{color: '#d51883'}}><LiaTimesSolid/></span>
                                                                        )}
                                                                    </div>
                                                                    <div className="dropdown-item">
                                                                    <span
                                                                        style={{fontWeight: "bold"}}>Depo koşulları:</span> {row.storageConditions || 'Girilmemiş'}
                                                                        {row.storageConditions ? (
                                                                            <span
                                                                                style={{color: '#83f333'}}><IoIosCheckmark/></span>
                                                                        ) : (
                                                                            <span
                                                                                style={{color: '#d51883'}}><LiaTimesSolid/></span>
                                                                        )}
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
                            <td colSpan={columns.length} style={{textAlign: 'center'}}>
                                Veri bulunamadı
                            </td>
                        </tr>
                    )}
                    </tbody>
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

export default StoreScreen;
