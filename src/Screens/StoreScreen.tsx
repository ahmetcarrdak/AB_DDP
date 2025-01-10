import React, { memo, useEffect, useState } from 'react';
import axios from 'axios';
import HeaderComponent from '../Components/HeaderComponent';
import { jsPDF } from 'jspdf';
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
import { FaInfoCircle, FaCalendarAlt } from 'react-icons/fa';

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
        { title: 'Adı', data: 'name' },
        { title: 'Miktar', data: 'quantity' },
        { title: 'Birim Fiyatı', data: 'unitPrice' },
        { title: 'Birim', data: 'unit' },
        { title: 'Tedarikçi Bilgisi', data: 'supplierInfo' },
        { title: 'Barkod', data: 'barcode' },
        { title: 'Seri Numarası', data: 'serialNumber' },
        { title: 'Ağırlık', data: 'weight' },
        { title: 'Boyutlar', data: 'dimensions' },
        { title: 'Depolama Koşulları', data: 'storageConditions' },
        { title: 'Son Envanter Tarihi', data: 'lastInventoryDate' },
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
    const StockStatusChart = ({ quantity, upperLimit, lowerLimit }: any) => {
        let fillColor = '#8884d8'; // Varsayılan renk

        if (quantity > upperLimit) {
            fillColor = '#40E0D0'; // Turkuaz, üst limitin üzerinde
        } else if (quantity < lowerLimit) {
            fillColor = '#FF6347'; // Kırmızı, alt limitin altında
        } else {
            fillColor = '#9370DB'; // Morumsu, limitsel aralıkta
        }

        // YAxis için domain aralığını dinamik olarak hesaplayalım
        const minValue =  0; //Math.min(quantity, lowerLimit);
        const maxValue = Math.max(quantity, upperLimit);

        // Grafik için yeni domain aralığını belirleyelim
        const yAxisDomain = [minValue - (minValue * 0.1), maxValue + (maxValue * 0.1)]; // %10'luk bir aralık ekleyerek genişletiyoruz

        return (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[{ name: 'Stok', quantity }]}>
                    <XAxis dataKey="name" />
                    <YAxis domain={yAxisDomain} /> {/* Dinamik domain */}
                    <Tooltip />
                    <Bar dataKey="quantity" fill={fillColor} />
                </BarChart>
            </ResponsiveContainer>
        );
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
                                                    <input
                                                        type="checkbox"
                                                        checked={editMode}
                                                        onChange={() => setEditMode(!editMode)}
                                                    />
                                                    <span>Düzenleme Modu</span>
                                                </div>

                                                {editMode ? (
                                                    <form>
                                                        {/* Form içerikleri burada olacak */}
                                                    </form>
                                                ) : (
                                                    <div>
                                                        <h4>Ürün Stok Durumu</h4>
                                                        <StockStatusChart
                                                            quantity={row.quantity}
                                                            upperLimit={row.maximumStockLevel}
                                                            lowerLimit={row.minimumStockLevel}
                                                        />

                                                        <div className="detail-section" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <div>
                                                                <FaInfoCircle />
                                                                <span>{row.supplierInfo}</span>
                                                            </div>
                                                            <div>
                                                                <FaCalendarAlt />
                                                                <span>{new Date(row.lastInventoryDate).toLocaleDateString()}</span>
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
                            <td colSpan={columns.length} style={{ textAlign: 'center' }}>
                                Veri bulunamadı
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>

                <div className="pagination" style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-start' }}>
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={"table-pagination-button"}
                    >
                        ‹
                    </button>
                    <span style={{ margin: '0 10px' }}>
            {currentPage} / {Math.ceil(filteredData.length / itemsPerPage)}
          </span>
                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage * itemsPerPage >= filteredData.length}
                        className={"table-pagination-button"}
                    >
                        ›
                    </button>
                </div>
            </div>
        </div>
    );
});

export default StoreScreen;
