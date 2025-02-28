import React, {memo, useEffect, useState} from "react";
import axios from "axios";
import {Link} from "react-router-dom";
import HeaderComponent from "../Components/HeaderComponent";
import {jsPDF} from "jspdf";
import "jspdf-autotable";
import {
    MdOutlineArrowBackIosNew,
    MdOutlineArrowForwardIos,
} from "react-icons/md";
import {
    AiOutlineFilePdf,
    AiOutlineUserAdd,
    AiOutlineUsergroupAdd,
} from "react-icons/ai";
import {Spin, Modal, Tabs, Upload, Button, Table, Input, Select} from "antd";
import {UploadOutlined, SaveOutlined, CloseOutlined} from "@ant-design/icons";
import {apiUrl} from "../Settings";
import PersonDetail from "../Components/TableDetailComponent/PersonDetail";
import * as XLSX from 'xlsx';
import {toast, ToastContainer} from "react-toastify";
import {BsPersonFillX} from "react-icons/bs";

const {TabPane} = Tabs;
const {Option} = Select;

interface ExcelRow {
    FirstName?: string;
    LastName?: string;
    IdentityNumber?: string;
    BirthDate?: string | Date;
    Address?: string;
    PhoneNumber?: string;
    Email?: string;
    HireDate?: string | Date;
    Department?: string;
    PositionId?: string | number;
    Salary?: string | number;
    IsActive?: boolean | string;
    BloodType?: string;
    EmergencyContact?: string;
    EmergencyPhone?: string;
    EducationLevel?: string;
    DriverLicenseType?: string;
    Notes?: string;
    VacationDays?: string | number;
    HasHealthInsurance?: boolean | string;
    LastHealthCheck?: string | Date;
}

const paginateData = (
    data: any[],
    currentPage: number,
    itemsPerPage: number
) => {
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
    return data.filter((row) =>
        Object.values(row).some((value) =>
            String(value).toLowerCase().includes(query.toLowerCase())
        )
    );
};

const PersonScreen = memo(() => {
    const [data, setData] = useState<any[]>([]);
    const [processedData, setProcessedData] = useState<any[]>([]);
    const [editableData, setEditableData] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [query, setQuery] = useState("");
    const [sortColumn, setSortColumn] = useState("");
    const [sortAscending, setSortAscending] = useState(true);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [isImportModalVisible, setImportModalVisible] = useState(false);
    const [excelData, setExcelData] = useState<any[]>([]);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [positions, setPositions] = useState<any[]>([]);
    const [loadingPositions, setLoadingPositions] = useState(false);
    const [positionMap, setPositionMap] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch positions first
                await fetchPositions();

                // Then fetch personnel data
                const response = await axios.get(apiUrl.person);
                setData(response.data);

                setLoading(false);
            } catch (error) {
                console.error("Verileri çekerken bir hata oluştu:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Fetch positions and create a mapping from ID to name
    const fetchPositions = async () => {
        setLoadingPositions(true);
        try {
            const response = await axios.get(apiUrl.positions);
            setPositions(response.data);

            // Create a mapping of position IDs to position names
            const mapping: { [key: number]: string } = {};
            response.data.forEach((position: any) => {
                mapping[position.positionId] = position.positionName;
            });
            setPositionMap(mapping);
            console.log("Pozisyonlar başarıyla çekildi:", response.data);
        } catch (error) {
            console.error("Pozisyonları çekerken bir hata oluştu:", error);
            toast.error("Pozisyon verileri yüklenemedi", {
                position: "bottom-right",
                autoClose: 3000,
                theme: "colored",
            });
        } finally {
            setLoadingPositions(false);
        }
    };

    // Process data to replace position IDs with position names
    useEffect(() => {
        if (data.length > 0 && Object.keys(positionMap).length > 0) {
            const processed = data.map(person => {
                // Find the position name from positionMap using positionId
                const positionName = positionMap[person.positionId] || "Bilinmeyen Pozisyon";

                return {
                    ...person,
                    positionName: positionName
                };
            });
            setProcessedData(processed);
        } else {
            setProcessedData(data);
        }
    }, [data, positionMap]);

    const columns = [
        {title: "Ad", data: "firstName"},
        {title: "Soyad", data: "lastName"},
        {title: "Departman", data: "department"},
        {title: "Pozisyon", data: "positionName"}, // Changed from positionId to positionName
        {title: "Telefon", data: "phoneNumber"},
        {title: "Email", data: "email"},
        {title: "Durum", data: "isActive"},
    ];

    const filteredData = filterData(processedData, query);
    const sortedData = sortColumn
        ? sortData(filteredData, sortColumn, sortAscending)
        : filteredData;
    const paginatedData = paginateData(sortedData, currentPage, itemsPerPage);

    const handleSort = (column: string) => {
        if (!isEditing) {
            if (sortColumn === column) {
                setSortAscending(!sortAscending);
            } else {
                setSortColumn(column);
                setSortAscending(true);
            }
        }
    };

    const toggleRow = (personId: number) => {
        if (!isEditing) {
            setExpandedRow(expandedRow === personId ? null : personId);
        }
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        const tableColumn = columns.map((col) => col.title);
        const tableRows = paginatedData.map((row) =>
            columns.map((col) => row[col.data])
        );
        //@ts-ignore
        doc.autoTable(tableColumn, tableRows);
        doc.save("personel.pdf");
    };

    const showImportModal = () => {
        setImportModalVisible(true);
        setExcelData([]);
        setUploadedFile(null);
    };

    const handleImportModalCancel = () => {
        setImportModalVisible(false);
        setExcelData([]);
        setUploadedFile(null);
    };

    const downloadSampleExcel = () => {
        // İndirilecek Excel dosyasının yolu
        const fileUrl = './ExampleFile/ornek_personel.xlsx'; // Dosyanın yolunu buraya yazın

        // Dosya adını belirleme (isteğe bağlı)
        const fileName = 'ornek_personel_listesi.xlsx';

        // Gizli bir <a> elementi oluşturma
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName; // İndirilen dosyanın adı

        // Elementi DOM'a ekleyip tıklama işlemi yapma
        document.body.appendChild(link);
        link.click();

        // Elementi temizleme
        document.body.removeChild(link);

        console.log("Örnek Excel indiriliyor...");
    };

    const handleFileUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const workbook = XLSX.read(e.target?.result, {type: 'binary'});
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                // İlk 5 satırı göster
                const firstFiveRows = jsonData.slice(0, 5);
                setExcelData(firstFiveRows);
                setUploadedFile(file);
            } catch (error) {
                console.error("Excel dosyasını okurken hata oluştu:", error);
                toast.error("Excel dosyası okunamadı, lütfen geçerli bir dosya giriniz", {
                    position: "bottom-right",
                    autoClose: 3000,
                    theme: "colored",
                });
            }
        };

        reader.readAsBinaryString(file);
        return false; // Antd Upload bileşeni tarafından otomatik yüklemeyi engelliyoruz
    };

    // Dosya kaldırıldığında önizlemeyi de kaldır
    const handleFileRemove = () => {
        setExcelData([]);
        setUploadedFile(null);
        return true; // Dosyanın kaldırılmasına izin ver
    };

    const uploadExcelData = async () => {
        if (!uploadedFile) {
            toast.error("Lütfen bir excel dosyası yükleyiniz", {
                position: "bottom-right",
                autoClose: 3000,
                theme: "colored",
            });
            return;
        }

        setUploading(true);

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const workbook = XLSX.read(e.target?.result, { type: 'binary' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const rawJsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

                    // Transform data to match backend DTO format
                    const formattedData = rawJsonData.map((row: any) => {
                        // Handle boolean conversions (assuming Excel has "Evet"/"Hayır" or similar)
                        const isActive = typeof row["Aktif Çalışıyor mu"] === 'boolean'
                            ? (row["Aktif Çalışıyor mu"] ? "evet" : "hayır")
                            : (String(row["Aktif Çalışıyor mu"]).toLowerCase() === 'true' ||
                            String(row["Aktif Çalışıyor mu"]).toLowerCase() === 'evet' ? true : false);

                        const hasHealthInsurance = typeof row["Sağlık sigortası var mı "] === 'boolean'
                            ? (row["Sağlık sigortası var mı "] ? "evet" : "hayır")
                            : (String(row["Sağlık sigortası var mı "]).toLowerCase() === 'true' ||
                            String(row["Sağlık sigortası var mı "]).toLowerCase() === 'evet' ? true : false);

                        // Convert dates from Excel format if needed
                        const birthDate = row["Doğum Tarihi"] ? new Date(row["Doğum Tarihi"]).toISOString() : null;
                        const hireDate = row["İşe Giriş Tarihi"] ? new Date(row["İşe Giriş Tarihi"]).toISOString() : null;
                        const lastHealthCheck = row["son sağlık kontrolü tarihi"] ? new Date(row["son sağlık kontrolü tarihi"]).toISOString() : null;

                        // Ensure PositionId is a number
                        const positionId = parseInt(String(row["Pozisyon Numarası"])) || 0;
                        const salary = parseFloat(String(row["Maaş"])) || 0;
                        const vacationDays = parseInt(String(row["Yıllık izin günü sayıısı"])) || 0;

                        return {
                            FirstName: row["İsim"] || "",
                            LastName: row["Soyisim"] || "",
                            IdentityNumber: row["T.C Kimlik No"] || "",
                            BirthDate: birthDate,
                            Address: row["Açık Adresi"] || "",
                            PhoneNumber: row["Telefon Numarası"] || "",
                            Email: row["E-Mail Adresi"] || "",
                            HireDate: hireDate,
                            Department: row["Departman"] || "",
                            PositionId: row["Pozisyon Numarası"] ||"",
                            Salary: salary,
                            IsActive: isActive,
                            BloodType: row["Kan Grubu"] || "",
                            EmergencyContact: row["Acil Durum Kişisi"] || "",
                            EmergencyPhone: row["Acil Durum Telefon Numarası"] || "",
                            EducationLevel: row["Eğitim Seviyesi"] || "",
                            DriverLicenseType: row["Ehliyet"] || "",
                            Notes: row["Özel Notlar"] || "",
                            VacationDays: vacationDays,
                            HasHealthInsurance: hasHealthInsurance,
                            LastHealthCheck: lastHealthCheck
                        };
                    });

                    console.log("Formatted data for API:", formattedData);

                    // Verileri API'ye gönder
                    await axios.post(apiUrl.personExelInsert, formattedData);

                    toast.success("Personel verileri başarı ile yüklendi", {
                        position: "bottom-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnFocusLoss: true,
                        draggable: true,
                        pauseOnHover: true,
                        theme: "colored",
                    });

                    // Modal'ı kapat ve durumu sıfırla
                    setImportModalVisible(false);
                    setExcelData([]);
                    setUploadedFile(null);

                    // Personel listesini yeniden yükle
                    const response = await axios.get(apiUrl.person);
                    setData(response.data);
                } catch (error) {
                    console.error("Verileri gönderirken hata oluştu:", error);

                    // API'den gelen hata mesajını göster
                    if (axios.isAxiosError(error)) {
                        toast.error(error.response?.data?.message || "Veriler yüklenirken bir hata oluştu", {
                            position: "bottom-right",
                            autoClose: 3000,
                            theme: "colored",
                        });
                    } else {
                        toast.error("Veriler yüklenirken bir hata oluştu", {
                            position: "bottom-right",
                            autoClose: 3000,
                            theme: "colored",
                        });
                    }
                } finally {
                    setUploading(false);
                }
            };

            reader.readAsBinaryString(uploadedFile);
        } catch (error) {
            console.error("Dosya işlenirken hata:", error);
            toast.error("Dosya yüklenirken bir hata oluştu", {
                position: "bottom-right",
                autoClose: 3000,
                theme: "colored",
            });
            setUploading(false);
        }
    };

    // Excel verilerini görüntülemek için tablo sütunlarını oluştur
    const excelColumns = excelData.length > 0
        ? Object.keys(excelData[0]).map(key => ({
            title: key,
            dataIndex: key,
            key: key,
        }))
        : [];

    // Editleme işlemleri
    const startEditing = async () => {
        setIsEditing(true);
        // Mevcut verilerin bir kopyasını oluştur
        setEditableData([...paginatedData]);
        // Pozisyon verilerini getir (zaten yüklendiyse tekrar çekmez)
        if (positions.length === 0) {
            await fetchPositions();
        }
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setEditableData([]);
    };

    const saveEditing = async () => {
        setLoading(true);
        try {
            // Tüm verileri tek bir API çağrısı ile gönder
            const dataToSend = editableData.map(row => {
                const {positionName, ...rest} = row;

                // positionId'nin undefined olup olmadığını kontrol et
                if (!rest.positionId && row.positionName) {
                    // positionName kullanarak positions array'inden ilgili position'ı bul
                    const position = positions.find(p => p.positionName === row.positionName);
                    if (position) {
                        rest.positionId = position.id;
                    }
                }

                return {
                    ...rest,
                    personId: rest.id,
                };
            });

            console.log("Gönderilen veriler:", dataToSend);
            await axios.post(`${apiUrl.personCollectiveUpdate}`, dataToSend);

            // Başarılı mesajı göster
            toast.success("Personel verileri başarı ile güncellendi", {
                position: "bottom-right",
                autoClose: 3000,
                theme: "colored",
            });

            // Güncel veriyi çek
            const response = await axios.get(apiUrl.person);
            setData(response.data);

            // Düzenleme modunu kapat
            setIsEditing(false);
            setEditableData([]);
        } catch (error) {
            console.error("Personel verileri güncellenirken hata oluştu:", error);
            toast.error("Veriler güncellenirken bir hata oluştu", {
                position: "bottom-right",
                autoClose: 3000,
                theme: "colored",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCellChange = (id: number, field: string, value: any) => {
        // Düzenlenen veriyi güncelle
        setEditableData(prevData =>
            prevData.map(row =>
                row.id === id ? {...row, [field]: value} : row
            )
        );
    };

    // Editable hücre bileşeni
    const EditableCell = ({rowId, field, value}: { rowId: number, field: string, value: any }) => {
        // Durum alanı için select kullan
        if (field === 'isActive') {
            return (
                <Select
                    value={value ? true : false}
                    onChange={(newValue) => handleCellChange(rowId, field, newValue)}
                    style={{width: '100%'}}
                >
                    <Option value={true}>Aktif</Option>
                    <Option value={false}>Pasif</Option>
                </Select>
            );
        }

        // Pozisyon alanı için select kullan
        if (field === 'positionName') {
            return (
                <Select
                    value={value}
                    onChange={(newValue) => {
                        // Seçilen pozisyonun ID'sini ve adını güncelle
                        const selectedPosition = positions.find(pos => pos.positionName === newValue);
                        if (selectedPosition) {
                            handleCellChange(rowId, 'positionId', selectedPosition.id);
                            handleCellChange(rowId, field, newValue);
                        }
                    }}
                    style={{width: '100%'}}
                    loading={loadingPositions}
                >
                    {positions.map(position => (
                        <Option key={position.id} value={position.positionName}>
                            {position.positionName}
                        </Option>
                    ))}
                </Select>
            );
        }

        // Diğer alanlar için input kullan
        return (
            <Input
                value={value}
                onChange={(e) => handleCellChange(rowId, field, e.target.value)}
                style={{width: '100%'}}
            />
        );
    };

    return (
        <div className="screen">
            <ToastContainer/>
            <div className="screen-header">
                <HeaderComponent/>
            </div>
            <Spin spinning={loading} tip="Personel verileri yükleniyor...">
                <div className="screen-body">
                    <input
                        type="text"
                        placeholder="Arama..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="table-seach-input"
                        disabled={isEditing}
                    />

                    <div className="table-head">
                        <label htmlFor="itemsPerPage"></label>
                        <select
                            id="itemsPerPage"
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            className="table-count-row"
                        >
                            <option value={10}>10</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={200}>200</option>
                        </select>
                        {isEditing ? (
                            // Düzenleme modu butonları
                            <>
                                <button
                                    onClick={saveEditing}
                                    className="table-action-button"
                                    style={{backgroundColor: '#4CAF50', color: 'white'}}
                                >
                                    <SaveOutlined/>
                                    Düzenlemeyi Onayla
                                </button>
                                <button
                                    onClick={cancelEditing}
                                    className="table-action-button"
                                    style={{backgroundColor: '#f44336', color: 'white'}}
                                >
                                    <CloseOutlined/>
                                    İptal Et
                                </button>
                            </>
                        ) : (
                            // Normal mod butonları
                            <>
                                <button onClick={downloadPDF} className="table-action-button">
                                    <AiOutlineFilePdf/>
                                    PDF Olarak İndir
                                </button>
                                <Link to={"/person-create"} className="table-action-button">
                                    <AiOutlineUserAdd/>
                                    Personel Ekle
                                </Link>
                                <button className="table-action-button" onClick={showImportModal}>
                                    <AiOutlineUsergroupAdd/>
                                    Personelleri içe aktar
                                </button>
                                <button className={"table-action-button"} onClick={startEditing}>
                                    <BsPersonFillX/>
                                    Toplu Düzenle
                                </button>
                            </>
                        )}
                    </div>
                    <table className="table">
                        <thead className="table-thead">
                        <tr>
                            <th>#</th>
                            {columns.map((col) => (
                                <th
                                    key={col.data}
                                    onClick={() => handleSort(col.data)}
                                    className={`table-thead-th ${!isEditing ? 'cursor-pointer' : ''}`}
                                >
                                    {col.title}{" "}
                                    {sortColumn === col.data && !isEditing && (sortAscending ? "↑" : "↓")}
                                </th>
                            ))}
                            <th>#</th>
                        </tr>
                        </thead>

                        <tbody>
                        {isEditing ? (
                            // Düzenleme modu tablosu
                            editableData.map((row, index) => (
                                <tr key={row.id} className="table-tbody">
                                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    {columns.map((col) => (
                                        <td key={col.data} className="table-tbody-td">
                                            <EditableCell
                                                rowId={row.id}
                                                field={col.data}
                                                value={row[col.data]}
                                            />
                                        </td>
                                    ))}
                                    <td>
                                        <span className="edit-row-button disabled">
                                            Düzenleniyor
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            // Normal tablo görünümü
                            paginatedData.length > 0 &&
                            paginatedData.map((row, index) => (
                                <React.Fragment key={row.id}>
                                    <tr
                                        onClick={() => toggleRow(row.id)}
                                        className="table-tbody"
                                    >
                                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        {columns.map((col) => (
                                            <td key={col.data} className="table-tbody-td">
                                                {col.data === "isActive"
                                                    ? row[col.data]
                                                        ? "Aktif"
                                                        : "Pasif"
                                                    : row[col.data]}
                                            </td>
                                        ))}
                                        <td>
                                            {isEditing ? (
                                                <span className="edit-row-button disabled">
                                                    Düzenleniyor
                                                </span>
                                            ) : (
                                                <Link to={`/person-update-user/${row.id}`}>
                                                    <button
                                                        className="edit-row-button"
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Satırın tıklanmasını engelle
                                                        }}
                                                    >
                                                        Düzenle
                                                    </button>
                                                </Link>
                                            )}
                                        </td>
                                    </tr>

                                    {expandedRow === row.id && (
                                        <tr>
                                            <td colSpan={columns.length + 2}>
                                                <PersonDetail id={row.id}/>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                        </tbody>
                    </table>

                    <div
                        className="pagination"
                        style={{
                            marginTop: "10px",
                            display: "flex",
                            justifyContent: "flex-start",
                        }}
                    >
                        <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1 || isEditing}
                            className="table-pagination-button"
                        >
                            <MdOutlineArrowBackIosNew/>
                        </button>
                        <span style={{margin: "0 10px"}}>
                          {currentPage} / {Math.ceil(filteredData.length / itemsPerPage)}
                        </span>
                        <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage * itemsPerPage >= filteredData.length || isEditing}
                            className="table-pagination-button"
                        >
                            <MdOutlineArrowForwardIos/>
                        </button>
                    </div>

                    {/* Modal - Personel Excel Yükleme */}
                    <Modal
                        title="Personelleri İçe Aktar"
                        open={isImportModalVisible}
                        onCancel={handleImportModalCancel}
                        footer={null}
                        width={800}
                    >
                        <Tabs defaultActiveKey="1">
                            <TabPane tab="Örnek Exceli Görüntüle" key="1">
                                <p>
                                    Personel verilerinin nasıl yükleneceğine dair örnek Excel
                                    dosyasını aşağıdaki butona tıklayarak indirebilirsiniz.
                                </p>
                                <Button type="primary" onClick={downloadSampleExcel}>
                                    Örnek Exceli İndir
                                </Button>
                            </TabPane>
                            <TabPane tab="Excel Yükle" key="2">
                                <p>Lütfen yüklemek istediğiniz Excel dosyasını seçin.</p>
                                <Upload
                                    beforeUpload={handleFileUpload}
                                    onRemove={handleFileRemove}
                                    accept=".xlsx, .xls"
                                    showUploadList={true}
                                    maxCount={1}
                                >
                                    <Button icon={<UploadOutlined/>}>Excel Seç</Button>
                                </Upload>

                                {excelData.length > 0 && (
                                    <div style={{marginTop: '20px'}}>
                                        <h3>Excel İçeriği (İlk 5 Satır)</h3>
                                        <Table
                                            dataSource={excelData}
                                            columns={excelColumns}
                                            pagination={false}
                                            bordered
                                            size="small"
                                            scroll={{x: 'max-content'}}
                                        />

                                        <div style={{marginTop: '20px', textAlign: 'right'}}>
                                            <Button
                                                type="primary"
                                                onClick={uploadExcelData}
                                                loading={uploading}
                                            >
                                                Verileri Yükle
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </TabPane>
                        </Tabs>
                    </Modal>
                </div>
            </Spin>
        </div>
    );
});

export default PersonScreen;