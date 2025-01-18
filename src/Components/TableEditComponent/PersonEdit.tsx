import React, { useState, useEffect } from "react";
import { Form, Input, DatePicker, Select, InputNumber, Switch, Button, Card, Row, Col, Typography } from "antd";
import axios from "axios";
import dayjs from "dayjs";  // dayjs kullanarak tarihleri formatlayabiliriz
import { apiUrl } from "../../Settings";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Title } = Typography;
const { Option } = Select;

// Position türünü tanımlayın
interface Position {
  positionId: number;
  positionName: string;
}

// PersonDetails türünü tanımlayın
interface PersonDetails {
  phoneNumber: string;
  email: string;
  terminationDate: string;
  department: string;
  positionId: number;
  salary: number;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  educationLevel: string;
  isActive: boolean;
  hasDriverLicense: boolean;
  driverLicenseType?: string;
  hasHealthInsurance: boolean;
  lastHealthCheck: string;
  shiftSchedule: string;
  vacationDays: number;
  notes: string;
}

// PersonEditModalProps türünü tanımlayın
interface PersonEditModalProps {
  show: boolean;
  onClose: () => void;
  id: number | null;
}

const PersonEditModal = ({ show, onClose, id }: PersonEditModalProps) => {
  const [form] = Form.useForm();
  const [positions, setPositions] = useState<Position[]>([]);
  const [personDetails, setPersonDetails] = useState<PersonDetails | null>(null);

  useEffect(() => {
    // Pozisyonları almak için API çağrısı
    const fetchPositions = async () => {
      try {
        const response = await axios.get(`${apiUrl.positions}`);
        setPositions(response.data);
      } catch (error) {
        console.error("Error fetching positions:", error);
        toast.error("Pozisyonlar yüklenirken bir hata oluştu", {
          position: "bottom-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    };

    fetchPositions();
  }, []);

  useEffect(() => {
    // Personel bilgilerini almak için API çağrısı
    const fetchPersonDetails = async () => {
      if (id === null) return;
      try {
        const response = await axios.get(`${apiUrl.personById}/${id}`);
        const data = response.data;

        // lastHealthCheck ve terminationDate tarihlerini dayjs formatına dönüştür
        const updatedData = {
          ...data,
          lastHealthCheck: data.lastHealthCheck ? dayjs(data.lastHealthCheck) : null,
          terminationDate: data.terminationDate ? dayjs(data.terminationDate) : null,
        };

        setPersonDetails(updatedData); // Durum bilgisini güncelle
        form.setFieldsValue(updatedData); // Form'u güncelle
      } catch (error) {
        console.error("Error fetching person details:", error);
        toast.error("Personel bilgileri yüklenirken bir hata oluştu", {
          position: "bottom-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    };

    fetchPersonDetails();
  }, [id, form]);

  const onFinish = async (values: any) => {
    try {
      // DatePicker'dan gelen tarihler dayjs formatında olacağı için, API'ye uygun formatta gönderebiliriz
      const formattedValues = {
        ...values,
        terminationDate: values.terminationDate ? values.terminationDate.toISOString() : null,
        lastHealthCheck: values.lastHealthCheck ? values.lastHealthCheck.toISOString() : null,
      };

      const response = await axios.put(`${apiUrl.personUpdate}`, formattedValues);
      toast.success("Personel başarıyla güncellendi", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
      onClose(); // Modal'ı kapatma
    } catch (error) {
      console.error("Error updating person:", error);
      toast.error("Personel güncellenirken bir hata oluştu", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  if (!show || !personDetails) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <ToastContainer />
        <Title level={2}>Personel Bilgileri Düzenle</Title>

        <Card>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Row gutter={16}>
              {/* Telefon Numarası */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="phoneNumber" label="Telefon Numarası">
                  <Input value={personDetails?.phoneNumber} />
                </Form.Item>
              </Col>

              {/* E-posta */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="email" label="E-posta">
                  <Input value={personDetails?.email} />
                </Form.Item>
              </Col>

              {/* Departman */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="department" label="Departman">
                  <Input value={personDetails?.department} />
                </Form.Item>
              </Col>

              {/* Pozisyon */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="positionId" label="Pozisyon">
                  <Select defaultValue={personDetails?.positionId}>
                    {positions.map((position) => (
                      <Option key={position.positionId} value={position.positionId}>
                        {position.positionName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* Maaş */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="salary" label="Maaş">
                  <InputNumber value={personDetails?.salary} style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              {/* Adres */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="address" label="Adres">
                  <Input.TextArea value={personDetails?.address} rows={2} />
                </Form.Item>
              </Col>

              {/* Acil İletişim */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="emergencyContact" label="Acil İletişim">
                  <Input value={personDetails?.emergencyContact} />
                </Form.Item>
              </Col>

              {/* Acil Telefon */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="emergencyPhone" label="Acil Telefon">
                  <Input value={personDetails?.emergencyPhone} />
                </Form.Item>
              </Col>

              {/* Eğitim Durumu */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="educationLevel" label="Eğitim Durumu">
                  <Input value={personDetails?.educationLevel} />
                </Form.Item>
              </Col>

              {/* Aktif Durum */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="isActive" label="Aktif Durum" valuePropName="checked">
                  <Switch checked={personDetails?.isActive} />
                </Form.Item>
              </Col>

              {/* Sürücü Belgesi */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="hasDriverLicense" label="Sürücü Belgesi" valuePropName="checked">
                  <Switch checked={personDetails?.hasDriverLicense} />
                </Form.Item>
              </Col>

              {/* Sağlık Sigortası */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="hasHealthInsurance" label="Sağlık Sigortası" valuePropName="checked">
                  <Switch checked={personDetails?.hasHealthInsurance} />
                </Form.Item>
              </Col>

              {/* İzin Günleri */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="vacationDays" label="İzin Günleri">
                  <InputNumber value={personDetails?.vacationDays} style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              {/* Notlar */}
              <Col xs={24}>
                <Form.Item name="notes" label="Notlar">
                  <Input.TextArea value={personDetails?.notes} rows={4} />
                </Form.Item>
              </Col>

              {/* İşten Ayrılma Tarihi */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="terminationDate" label="İşten Ayrılma Tarihi">
                  <DatePicker
                    style={{ width: "100%" }}
                    value={personDetails?.terminationDate ? dayjs(personDetails.terminationDate) : null}
                  />
                </Form.Item>
              </Col>

              {/* Son Sağlık Kontrolü */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="lastHealthCheck" label="Son Sağlık Kontrolü">
                  <DatePicker
                    style={{ width: "100%" }}
                    value={personDetails?.lastHealthCheck ? dayjs(personDetails.lastHealthCheck) : null}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                Güncelle
              </Button>
              <Button onClick={onClose}>İptal</Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default PersonEditModal;
