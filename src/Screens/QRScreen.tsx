import React, {useEffect, useState} from "react";
import {Form, Input, Button, Spin, notification} from "antd";
import {useParams} from "react-router-dom";
import apiClient from "../Utils/ApiClient";
import {BarcodeOutlined, SendOutlined} from "@ant-design/icons";
import {ToastContainer, toast} from "react-toastify";

const QRScreen: React.FC = () => {
    const {id} = useParams<{ id: string }>(); // URL’den gelen makine ID’si
    const [barcode, setBarcode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [machineName, setMachineName] = useState("");

    useEffect(() => {
        if (!id) {
            notification.error({message: "Makine ID bulunamadı!"});
            return;
        }
        fetchMachineDetails();
    }, [id]);

    const fetchMachineDetails = async () => {
        try {
            const response = await apiClient.get(`/Machine/${id}`);
            setMachineName(response.data.name);
        } catch (error) {
            notification.error({message: "Makine bilgisi alınamadı!"});
        }
    };

    const handleSubmit = async () => {
        if (!barcode.trim()) {
            notification.warning({message: "Barkod alanı boş olamaz!"});
            return;
        }

        setIsLoading(true);
        try {
            // URL'yi oluşturun ve GET isteğini yapın
            const response = await apiClient.post("ProductionInstruction/process", null, {
                params: {
                    machineId: id,
                    barcode: barcode,
                },
            });

           // Başarılı işlem sonrası bildirim
            if (response.data === "lineError") {
                toast.error("İşlem sırası ihlali, lütfen hattı koruyunuz");
            } else if (response.data === "exitError") {
                toast.error("Makineden çıkış yapmış, tekrar giriş yapamazsınız");
            } else if (response.data === "entry") {
                toast.success("Makineden giriş yapıldı, teşekkür ederiz");
                setBarcode(""); // Barkod alanını sıfırla
            } else if (response.data === "exit") {
                toast.success("Makineden çıkış yapıldı, teşekkür ederiz");
                setBarcode(""); // Barkod alanını sıfırla
            }
        } catch (error) {
            notification.error({message: "İşlem sırasında hata oluştu!"});
        } finally {
            setIsLoading(false);
        }
    };

    if (!id) return <Spin tip="Yükleniyor..."/>;

    return (
        <div style={{maxWidth: 400, margin: "auto", padding: "20px"}}>
            <h2>Makine: {machineName || "Bilinmiyor"}</h2>
            <ToastContainer/>
            <Form layout="vertical">
                <Form.Item label="Üretim Talimatı Barkodu">
                    <Input
                        prefix={<BarcodeOutlined/>}
                        placeholder="Barkodu okutun veya yazın"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        autoFocus
                    />
                </Form.Item>

                <Button
                    type="primary"
                    icon={<SendOutlined/>}
                    loading={isLoading}
                    onClick={handleSubmit}
                    block
                >
                    İşlemi Tamamla
                </Button>
            </Form>
        </div>
    );
};

export default QRScreen;
