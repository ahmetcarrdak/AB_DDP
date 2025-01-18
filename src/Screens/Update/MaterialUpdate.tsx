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
  Select,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { apiUrl } from "../../Settings";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Title } = Typography;
const { Option } = Select;

interface Material {
  storeId: number;
  name: string;
}

interface MaterialDetails {
  storeId: number;
  name: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  location: string;
  supplierInfo: string;
  purchaseDate: string | null;
  expiryDate: string | null;
  barcode: string;
  serialNumber: string;
  isActive: boolean;
  minimumStockLevel: number;
  maximumStockLevel: number;
  weight: number;
  dimensions: string;
  storageConditions: string;
  lastInventoryDate: string | null;
  qualityStatus: string;
  createdDate: string | null;
  updatedDate: string | null;
}

const MaterialUpdate = () => {
  const [form] = Form.useForm();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
  const [materialDetails, setMaterialDetails] = useState<MaterialDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await axios.get(`${apiUrl.store}`);
        setMaterials(response.data);
      } catch (error) {
        console.error("Error fetching materials:", error);
        toast.error("Malzeme listesi yüklenirken bir hata oluştu", {
          position: "bottom-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    };

    fetchMaterials();
  }, []);

  useEffect(() => {
    const fetchMaterialDetails = async () => {
      if (!selectedMaterialId) return;

      setIsLoadingDetails(true);
      try {
        const response = await axios.get(`${apiUrl.storeById}/${selectedMaterialId}`);
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

        setMaterialDetails(updatedData);
        form.setFieldsValue(updatedData);
      } catch (error) {
        console.error("Error fetching material details:", error);
        toast.error("Malzeme bilgileri yüklenirken bir hata oluştu", {
          position: "bottom-right",
          autoClose: 3000,
          theme: "colored",
        });
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchMaterialDetails();
  }, [selectedMaterialId, form]);

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

  const handleMaterialSelect = (value: number) => {
    setSelectedMaterialId(value);
    form.resetFields();
  };

  return (
    <div className="material-update-page">
      <ToastContainer />
      <Title level={2}>Malzeme Bilgileri Düzenle</Title>

      <Card style={{ marginBottom: 16 }}>
        <Form.Item label="Malzeme Seç" required>
          <Select
            showSearch
            style={{ width: "100%" }}
            placeholder="Malzeme ara..."
            optionFilterProp="children"
            onChange={handleMaterialSelect}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={materials.map((material) => ({
              value: material.storeId,
              label: material.name,
            }))}
          />
        </Form.Item>
      </Card>

      {selectedMaterialId && (
        <Spin spinning={isLoadingDetails} tip="Malzeme bilgileri yükleniyor...">
          <Card>
            {materialDetails && (
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
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        block
                        loading={isUpdating}
                      >
                        {isUpdating ? 'Güncelleniyor...' : 'Kaydet'}
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            )}
          </Card>
        </Spin>
      )}
    </div>
  );
};

export default MaterialUpdate;