import React, { memo } from "react";
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
  Select,
} from "antd";
import axios from "axios";
import { apiUrl } from "../../Settings";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Common units for materials
const units = [
  "Adet",
  "Kg",
  "Gram",
  "Litre",
  "Metre",
  "m²",
  "m³",
  "Paket",
  "Kutu",
];

// Quality status options
const qualityStatuses = ["Yeni", "İyi", "Orta", "Kötü", "Hurda"];

const MaterialAddScreen = memo(() => {
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      // Convert the values object to match the backend model
      const materialData = {
        ...values,
        createdDate: new Date(),
        updatedDate: new Date(),
      };

      const response = await axios.post(apiUrl.createStore, materialData);
      toast.success("Malzeme başarıyla oluşturuldu", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        rtl: false,
        pauseOnFocusLoss: true,
        draggable: true,
        pauseOnHover: true,
        theme: "colored",
      });
      form.resetFields();
    } catch (error) {
      console.error("Error creating material:", error);
      toast.error("Malzeme oluşturulurken bir hata oluştu", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  return (
    <>
      <div style={{ padding: "20px" }}>
        <ToastContainer />
        <Title level={2}>Yeni Malzeme Ekle</Title>

        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              isActive: true,
              quantity: 0,
              minimumStockLevel: 0,
              maximumStockLevel: 0,
              weight: 0,
            }}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="name"
                  label="Malzeme Adı"
                  rules={[
                    { required: true, message: "Lütfen malzeme adını giriniz" },
                  ]}
                >
                  <Input maxLength={100} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="category" label="Kategori">
                  <Input maxLength={50} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="quantity"
                  label="Kaç Adet"
                  rules={[
                    {
                      required: true,
                      message: "Lütfen stok miktarını giriniz",
                    },
                  ]}
                >
                  <InputNumber style={{ width: "100%" }} min={0} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="unitPrice"
                  label="Birim Fiyat"
                  rules={[
                    { required: true, message: "Lütfen birim fiyatı giriniz" },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    formatter={(value) =>
                      `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value!.replace(/₺\s?|(,*)/g, "")}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="unit"
                  label="Ölçü Birimi"
                  rules={[
                    { required: true, message: "Lütfen ölçü birimi seçiniz" },
                  ]}
                >
                  <Select placeholder="Ölçü birimi seçiniz">
                    {units.map((unit) => (
                      <Option key={unit} value={unit}>
                        {unit}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="location" label="Depo Konumu">
                  <Input maxLength={100} placeholder="Malzemenin depoda ki konumu" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="supplierInfo" label="Tedarikçi Bilgisi">
                  <Input maxLength={200} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="purchaseDate"
                  label="Satın Alma Tarihi"
                  rules={[
                    {
                      required: true,
                      message: "Lütfen satın alma tarihini giriniz",
                    },
                  ]}
                >
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
                  <Input maxLength={50} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="serialNumber" label="Seri Numarası">
                  <Input maxLength={50} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="weight" label="Ağırlık">
                  <InputNumber style={{ width: "100%" }} min={0} step={0.1} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="dimensions" label="Boyutlar">
                  <Input placeholder="En x Boy x Yükseklik" maxLength={50} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="lastInventoryDate" label="Son Sayım Tarihi">
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="qualityStatus" label="Kalite Durumu">
                  <Select placeholder="Kalite durumu seçiniz">
                    {qualityStatuses.map((status) => (
                      <Option key={status} value={status}>
                        {status}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={24} md={24}>
                <Form.Item
                  name="isActive"
                  label="Malzeme Aktif Mi?"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  name="minimumStockLevel"
                  label="Minimum olması gereken stok miktarı"
                  rules={[
                    {
                      required: true,
                      message: "Lütfen minimum olması gereken stok miktarını giriniz",
                    },
                  ]}
                >
                  <Input placeholder="" maxLength={50} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  name="maximumStockLevel"
                  label="Maksimum olması gereken stok miktarı"
                  rules={[
                    {
                      required: true,
                      message: "Lütfen maksimum olması gereken stok miktarını giriniz",
                    },
                  ]}
                >
                  <Input placeholder="" maxLength={50} />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item name="description" label="Açıklama">
                  <TextArea maxLength={500} />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item name="storageConditions" label="Depolama Koşulları">
                  <TextArea maxLength={500} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Kaydet
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </>
  );
});

export default MaterialAddScreen;
