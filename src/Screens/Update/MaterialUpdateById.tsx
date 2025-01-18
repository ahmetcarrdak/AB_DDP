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

const { Title } = Typography;


const MaterialUpdateById = () => {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [isLoadingMaterial, setIsLoadingMaterial] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchMaterialDetails = async () => {
      if (!id) return;

      setIsLoadingMaterial(true);
      try {
        const response = await axios.get(`${apiUrl.storeById}/${id}`);
        const data = response.data;

        const updatedData = {
          ...data,
          purchaseDate: data.purchaseDate ? dayjs(data.purchaseDate) : null,
          expiryDate: data.expiryDate ? dayjs(data.expiryDate) : null,
          lastInventoryDate: data.lastInventoryDate
            ? dayjs(data.lastInventoryDate)
            : null,
          createdDate: data.createdDate ? dayjs(data.createdDate) : null,
          updatedDate: data.updatedDate ? dayjs(data.updatedDate) : null,
        };

        form.setFieldsValue(updatedData);
      } catch (error) {
        console.error("Error fetching material details:", error);
        toast.error("Malzeme bilgileri yüklenirken bir hata oluştu", {
          position: "bottom-right",
          autoClose: 3000,
          theme: "colored",
        });
      } finally {
        setIsLoadingMaterial(false);
      }
    };

    fetchMaterialDetails();
  }, [id, form]);

  const onFinish = async (values: any) => {
    setIsUpdating(true);
    try {
      const formattedValues = {
        ...values,
        purchaseDate: values.purchaseDate
          ? values.purchaseDate.toISOString()
          : null,
        expiryDate: values.expiryDate ? values.expiryDate.toISOString() : null,
        lastInventoryDate: values.lastInventoryDate
          ? values.lastInventoryDate.toISOString()
          : null,
        createdDate: values.createdDate ? values.createdDate.toISOString() : null,
        updatedDate: values.updatedDate ? values.updatedDate.toISOString() : null,
      };
      console.log(formattedValues);
      await axios.put(`${apiUrl.storeUpdate}`, formattedValues);
      toast.success("Malzeme başarıyla güncellendi", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
    } catch (error) {
      console.error("Error updating material:", error);
      toast.error("Malzeme güncellenirken bir hata oluştu", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!id) return null;

  return (
    <div className="material-update-page">
      <ToastContainer />
      <Title level={2}>Malzeme Bilgileri Düzenle</Title>
      <Spin spinning={isLoadingMaterial} tip="Malzeme bilgileri yükleniyor...">
        <Card>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="name" label="Malzeme Adı" rules={[{ required: true }]}>
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
                <Form.Item name="quantity" label="Miktar" rules={[{ type: "number" }]}>
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="unitPrice" label="Birim Fiyatı" rules={[{ type: "number" }]}>
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="unit" label="Birim">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="location" label="Lokasyon">
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
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="barcode" label="Barkod">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="serialNumber" label="Seri Numarası">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="isActive" label="Aktif Mi" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="minimumStockLevel" label="Minimum Stok Seviyesi">
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="maximumStockLevel" label="Maksimum Stok Seviyesi">
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="weight" label="Ağırlık">
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="dimensions" label="Boyutlar">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="storageConditions" label="Depolama Koşulları">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="lastInventoryDate" label="Son Envanter Tarihi">
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="qualityStatus" label="Kalite Durumu">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={isUpdating}>
                    Güncelle
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      </Spin>
    </div>
  );
};

export default MaterialUpdateById;
