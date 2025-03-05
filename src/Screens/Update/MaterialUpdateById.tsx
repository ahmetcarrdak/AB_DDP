import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  DatePicker,
  InputNumber,
  Switch,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Spin,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { apiUrl } from "../../Settings";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "react-router-dom";
import apiClient from "../../Utils/ApiClient";

const { Title } = Typography;

const MaterialUpdateById = () => {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [isLoadingMaterial, setIsLoadingMaterial] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchMaterialDetails = async () => {
    if (!id) return; // id yoksa işlemi başlatma

    setIsLoadingMaterial(true); // Yükleme başladığını belirtiyoruz
    try {
      const url = apiUrl.storeById(id); // Örnek: "Person/22"
      const response = await apiClient.get(url); // Doğru URL
      const data = response.data;

      // Verileri düzenleyerek form alanlarına atıyoruz
      const updatedData = {
        ...data,
        purchaseDate: data.purchaseDate ? dayjs(data.purchaseDate) : null,
        expiryDate: data.expiryDate ? dayjs(data.expiryDate) : null,
        lastInventoryDate: data.lastInventoryDate
            ? dayjs(data.lastInventoryDate)
            : null,
      };

      form.setFieldsValue(updatedData); // Form alanlarını güncelliyoruz
    } catch (error) {
      console.error("Malzeme bilgileri alınırken hata oluştu:", error);
      toast.error("Malzeme bilgileri yüklenirken bir hata oluştu", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setIsLoadingMaterial(false); // Yükleme bitiyor
    }
  };

  useEffect(() => {
    fetchMaterialDetails();
  }, [id, form]); // id veya form değiştiğinde bu effect çalışır

// Form gönderme fonksiyonu
  const onFinish = async (values: any) => {
    setIsUpdating(true); // Güncelleme işlemi başladığını belirtiyoruz
    try {
      // Tarihleri uygun formata dönüştürüp düzenliyoruz
      const formattedValues = {
        ...values,
        purchaseDate: values.purchaseDate ? values.purchaseDate.toISOString() : null,
        expiryDate: values.expiryDate ? values.expiryDate.toISOString() : null,
        lastInventoryDate: values.lastInventoryDate ? values.lastInventoryDate.toISOString() : null,
      };

      // Malzemeyi güncelliyoruz
      await apiClient.put(`${apiUrl.updateStore}`, formattedValues);  // apiClient kullanıyoruz
      toast.success("Malzeme başarıyla güncellendi", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
    } catch (error) {
      console.error("Malzeme güncellenirken hata oluştu:", error);
      toast.error("Malzeme güncellenirken bir hata oluştu", {
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
        <Title level={2}>Malzeme Bilgileri Düzenle</Title>
        <Spin spinning={isLoadingMaterial} tip="Malzeme bilgileri yükleniyor...">
          <Card>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              {/* Temel Bilgiler */}
              <SectionTitle title="Temel Bilgiler" />
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                      name="name"
                      label="Malzeme Adı"
                      rules={[{ required: true, message: "Lütfen malzeme adını giriniz" }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item name="storeId" hidden>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="description" label="Açıklama">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="category" label="Kategori">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                      name="quantity"
                      label="Miktar"
                      rules={[{ required: true, message: "Lütfen miktarı giriniz" }]}
                  >
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                      name="unitPrice"
                      label="Birim Fiyatı"
                      rules={[{ required: true, message: "Lütfen birim fiyatını giriniz" }]}
                  >
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                      name="unit"
                      label="Birim"
                      rules={[{ required: true, message: "Lütfen birimi giriniz" }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              {/* Depolama ve Tedarik Bilgileri */}
              <SectionTitle title="Depolama ve Tedarik Bilgileri" />
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                      name="location"
                      label="Lokasyon"
                      rules={[{ required: true, message: "Lütfen lokasyonu giriniz" }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="supplierInfo" label="Tedarikçi Bilgisi">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="purchaseDate" label="Satın Alma Tarihi">
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="expiryDate" label="Son Kullanma Tarihi">
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>

              {/* Stok ve Envanter Bilgileri */}
              <SectionTitle title="Stok ve Envanter Bilgileri" />
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                      name="minimumStockLevel"
                      label="Minimum Stok Seviyesi"
                      rules={[{ required: true, message: "Lütfen minimum stok seviyesini giriniz" }]}
                  >
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                      name="maximumStockLevel"
                      label="Maksimum Stok Seviyesi"
                      rules={[{ required: true, message: "Lütfen maksimum stok seviyesini giriniz" }]}
                  >
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="lastInventoryDate" label="Son Envanter Sayım Tarihi">
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>

              {/* Diğer Bilgiler */}
              <SectionTitle title="Diğer Bilgiler" />
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="isActive" label="Aktif Mi" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="qualityStatus" label="Kalite Durumu">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="storageConditions" label="Depolama Koşulları">
                    <Input />
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

export default MaterialUpdateById;

// Alt bileşenler
const SectionTitle = ({ title }: { title: string }) => (
    <Col xs={24}>
      <Typography.Text strong style={{ fontSize: "16px", display: "block", marginBottom: "16px" }}>
        {title}
      </Typography.Text>
    </Col>
);
