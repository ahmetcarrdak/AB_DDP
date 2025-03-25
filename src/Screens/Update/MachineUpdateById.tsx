import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  DatePicker,
  Switch,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Spin,
  InputNumber,
} from "antd";
import dayjs from "dayjs";
import { apiUrl } from "../../Settings";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "react-router-dom";
import apiClient from "../../Utils/ApiClient";
import HeaderComponent from "../../Components/HeaderComponent";

const { Title } = Typography;

interface MaciheScreenProps {
  onToggleMenu: () => void;
}

const MachineUpdateById:React.FC<MaciheScreenProps>  = ({onToggleMenu}) => {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [isLoadingMachine, setIsLoadingMachine] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchMachineDetails = async () => {
    if (!id) return;

    setIsLoadingMachine(true);
    try {
      const url = apiUrl.machineById(id);
      const response = await apiClient.get(url);
      const data = response.data;

      // Verileri düzenleyerek form alanlarına atıyoruz
      const updatedData = {
        ...data,
      };

      form.setFieldsValue(updatedData); // Form alanlarını güncelliyoruz
    } catch (error) {
      console.error("Makine bilgileri alınırken hata oluştu:", error);
      toast.error("Makine bilgileri yüklenirken bir hata oluştu", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setIsLoadingMachine(false); // Yükleme bitiyor
    }
  };

  useEffect(() => {
    fetchMachineDetails();
  }, [id, form]); // id veya form değiştiğinde bu effect çalışır

// Form gönderme fonksiyonu
  const onFinish = async (values: any) => {
    setIsUpdating(true); // Güncelleme işlemi başladığını belirtiyoruz
    try {
      // Tarihleri uygun formata dönüştürüp düzenliyoruz
      const formattedValues = {
        ...values,
      };
      console.log(formattedValues);
      // Makineyi güncelliyoruz
      await apiClient.put(`${apiUrl.machine}`, formattedValues);
      toast.success("Makine başarıyla güncellendi", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
    } catch (error) {
      console.error("Makine güncellenirken hata oluştu:", error);
      toast.error("Makine güncellenirken bir hata oluştu", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setIsUpdating(false); // Güncelleme işlemi tamamlanıyor
    }
  };

  if (!id) return null;

  return (
    <div style={{ padding: "20px" }}>
      <ToastContainer />
      <HeaderComponent onToggleMenu={onToggleMenu}/>
      <Title level={2}>Makine Bilgileri Düzenle</Title>
      <Spin spinning={isLoadingMachine} tip="Makine bilgileri yükleniyor...">
        <Card>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            {/* Temel Bilgiler */}
            <SectionTitle title="Temel Bilgiler" />
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="name"
                  label="Makine Adı"
                  rules={[
                    { required: true, message: "Lütfen makine adını giriniz" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="serialNumber"
                  label="Makine Kodu"
                  rules={[
                    { required: true, message: "Lütfen makine kodunu giriniz" },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item name="id" hidden>
                  <Input />
                </Form.Item>
                <Form.Item name="companyId" hidden>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="location"
                  label="Lokasyon"
                  rules={[
                    { required: true, message: "Lütfen lokasyonu giriniz" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="manufacturer"
                  label="Üretici"
                  rules={[
                    { required: true, message: "Lütfen üreticiyi giriniz" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="model"
                  label="Model"
                  rules={[{ required: true, message: "Lütfen modeli giriniz" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            {/* Durum Bilgileri */}
            <SectionTitle title="Durum Bilgileri" />
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="isOperational"
                  label="Çalışır Durumda Mı?"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            {/* Kaydet Butonu */}
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isUpdating}>
                Güncelle
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Spin>
    </div>
  );
};

export default MachineUpdateById;

// Alt bileşenler
const SectionTitle = ({ title }: { title: string }) => (
  <Col xs={24}>
    <Typography.Text
      strong
      style={{ fontSize: "16px", display: "block", marginBottom: "16px" }}
    >
      {title}
    </Typography.Text>
  </Col>
);
