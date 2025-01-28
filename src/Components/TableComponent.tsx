import React, { useState, useMemo } from 'react';
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos } from 'react-icons/md';
import { Spin } from 'antd';

// Define a generic type for table columns
interface TableColumn<T> {
  title: string;
  key: keyof T;
  render?: (value: any, record: T) => React.ReactNode;
}

// Table component props interface
interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  loadingText?: string;
  itemsPerPageOptions?: number[];
  onRowClick?: (record: T) => void;
  onRowEdit?: (record: T) => void;
}

function GenericTable<T extends { id?: number | string }>(props: TableProps<T>) {
  const {
    data,
    columns,
    loading = false,
    loadingText = 'Veriler yükleniyor...',
    itemsPerPageOptions = [10, 50, 100, 200],
    onRowClick,
    onRowEdit
  } = props;

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);
  const [query, setQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: keyof T, direction: 'asc' | 'desc'} | null>(null);

  // Filtering
  const filteredData = useMemo(() => {
    if (!query) return data;
    return data.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [data, query]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    return [...filteredData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) 
        return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) 
        return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  // Sort handler
  const handleSort = (key: keyof T) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <Spin spinning={loading} tip={loadingText}>
      <div className="table-container">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Arama..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="table-search-input"
        />

        {/* Table controls */}
        <div className="table-controls">
          <select 
            value={itemsPerPage} 
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="table-count-row"
          >
            {itemsPerPageOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <table className="table">
          <thead className="table-thead">
            <tr>
              <th>#</th>
              {columns.map(col => (
                <th 
                  key={String(col.key)} 
                  onClick={() => handleSort(col.key)}
                  className="table-thead-th"
                >
                  {col.title}
                  {sortConfig?.key === col.key && 
                    (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                </th>
              ))}
              {onRowEdit && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr 
                key={item.id} 
                onClick={() => onRowClick && onRowClick(item)}
                className="table-tbody"
              >
                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                {columns.map(col => (
                  <td key={String(col.key)} className="table-tbody-td">
                    {col.render 
                      ? col.render(item[col.key], item) 
                      : String(item[col.key])
                    }
                  </td>
                ))}
                {onRowEdit && (
                  <td>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowEdit(item);
                      }} 
                      className="edit-row-button"
                    >
                      Düzenle
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1}
            className="table-pagination-button"
          >
            <MdOutlineArrowBackIosNew />
          </button>
          <span>
            {currentPage} / {Math.ceil(sortedData.length / itemsPerPage)}
          </span>
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage * itemsPerPage >= sortedData.length}
            className="table-pagination-button"
          >
            <MdOutlineArrowForwardIos />
          </button>
        </div>
      </div>
    </Spin>
  );
}

export default GenericTable;