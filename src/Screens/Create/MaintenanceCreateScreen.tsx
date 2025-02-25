import React, { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, Select, message } from 'antd';
import axios from 'axios';
import moment from 'moment';

const MaintenanceCreateScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [machines, setMachines] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Makineler listesini API'den çekme
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await axios.get('API_URL_FOR_MACHINES');
        setMachines(response.data); // Makineleri API'den aldık
      } catch (error) {
        message.error('Failed to load machines');
      }
    };

    fetchMachines();
  }, []);

  const handleSubmit = async (values: any) => {
    const payload = {
      maintenanceRecordId: 0, // Server tarafından otomatik oluşturulacak
      machineId: values.machineId,
      maintenanceType: values.maintenanceType,
      description: values.description,
      maintenanceDate: values.maintenanceDate.format(),
      performedBy: values.performedBy,
      notes: values.notes,
    };

    setIsSubmitting(true);
    setLoading(true);

    try {
      // Bakım kaydını API'ye gönderme
      await axios.post('API_URL_FOR_MAINTENANCE', payload);
      message.success('Maintenance record created successfully!');
    } catch (error) {
      message.error('Failed to create maintenance record');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px' }}>
      <h2>Create Maintenance Record</h2>
      <Form onFinish={handleSubmit} layout="vertical">
        <Form.Item
          label="Makine Seçiniz"
          name="machineId"
          rules={[{ required: true, message: 'Please select a machine' }]}
        >
          <Select
            placeholder="Select a machine"
            loading={machines.length === 0} // Makineler yüklenirken loading state'i
            disabled={machines.length === 0} // Makineler yüklenmeden seçilemiyor
          >
            {machines.map((machine) => (
              <Select.Option key={machine.machineId} value={machine.machineId}>
                {machine.machineName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Bakım Tipi"
          name="maintenanceType"
          rules={[{ required: true, message: 'Please enter the maintenance type' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Açıklama"
          name="description"
          rules={[{ required: true, message: 'Please enter a description' }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          label="Bakım Tarihi"
          name="maintenanceDate"
          rules={[{ required: true, message: 'Please select the maintenance date' }]}
        >
          <DatePicker defaultValue={moment()} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Bakım Yapan Kişi"
          name="performedBy"
          rules={[{ required: true, message: 'Please enter the name of the person who performed the maintenance' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Notlar"
          name="notes"
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading || isSubmitting}
            style={{ width: '100%' }}
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default MaintenanceCreateScreen;
