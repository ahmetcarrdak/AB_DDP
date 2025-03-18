import React, {useState, useEffect} from 'react';
import {Form, Input, Button, Select, message, Row, Col} from 'antd';
import {MdDeleteForever} from "react-icons/md";
import {apiUrl} from "../../Settings";
import HeaderComponent from "../../Components/HeaderComponent";
import type { Dayjs } from 'dayjs';
import apiClient from "../../Utils/ApiClient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Machine {
    id: number;
    name: string;
}

interface ProductionStore {
    name: string;
    barkod: string;
}

interface ProductionToMachine {
    machineId: number;
    line: number;
    entryDate: string | null;
    exitDate: string | null;
}

interface ProductionInstruction {
    title: string;
    description: string;
    productionToMachines: ProductionToMachine[];
    productionStores: ProductionStore[];
}

interface ProdutionInstructionProps {
    onToggleMenu: () => void;
}


const ProductionInstructionInsert: React.FC<ProdutionInstructionProps> = ({onToggleMenu}) => {
    const [form] = Form.useForm();
    const [machines, setMachines] = useState<Machine[]>([]);
    const [productionToMachines, setProductionToMachines] = useState<ProductionToMachine[]>([]);
    const [productionStores, setProductionStores] = useState<ProductionStore[]>([]);

    useEffect(() => {
        // Fetch machines from API
        const fetchMachines = async () => {
            try {
                const response = await apiClient.get(apiUrl.machine);
                setMachines(response.data);
            } catch (error) {
                message.error('Makineler yüklenirken bir hata oluştu');
            }
        };
        fetchMachines();
    }, []);

    const handleAddMachine = () => {
        setProductionToMachines([
            ...productionToMachines,
            {
                machineId: 0,
                line: productionToMachines.length + 1,
                entryDate: null,
                exitDate: null
            }
        ]);
    };

    const handleMachineChange = (value: number, index: number) => {
        const newMachines = [...productionToMachines];
        newMachines[index].machineId = value;
        setProductionToMachines(newMachines);
    };

    const handleDateChange = (dateType: 'entryDate' | 'exitDate', date: Dayjs | null, index: number) => {
        const newMachines = [...productionToMachines];
        newMachines[index][dateType] = date ? date.toISOString() : null;
        setProductionToMachines(newMachines);
    };

    const handleRemoveMachine = (index: number) => {
        const newMachines = productionToMachines.filter((_, idx) => idx !== index);
        // Reorder line numbers
        const reorderedMachines = newMachines.map((machine, idx) => ({
            ...machine,
            line: idx + 1
        }));
        setProductionToMachines(reorderedMachines);
    };

    // Production Store functionality (previously semiFinishedProducts)
    const handleAddProductionStore = () => {
        setProductionStores([
            ...productionStores,
            {name: '', barkod: ''}
        ]);
    };

    const handleProductionStoreChange = (field: 'name' | 'barkod', value: string, index: number) => {
        const newStores = [...productionStores];
        newStores[index][field] = value;
        setProductionStores(newStores);
    };

    const handleRemoveProductionStore = (index: number) => {
        const newStores = productionStores.filter((_, idx) => idx !== index);
        setProductionStores(newStores);
    };

    const onFinish = async (values: any) => {
        try {
            const payload: ProductionInstruction = {
                title: values.title,
                description: values.description,
                productionToMachines: productionToMachines,
                productionStores: productionStores.map(store => ({
                    name: store.name,
                    barkod: store.barkod
                }))
            };

            // Use a direct URL since productionInstructions might not be in apiUrl
            await apiClient.post(apiUrl.ProductionIns, payload);
            toast.success('Üretim talimatı başarıyla kaydedildi');
            form.resetFields();
            setProductionToMachines([]);
            setProductionStores([]);
        } catch (error) {
            message.error('Kayıt sırasında bir hata oluştu');
        }
    };

    return (
        <>
            <HeaderComponent onToggleMenu={onToggleMenu}/>
            <ToastContainer/>
            <div style={{marginTop: 20}}></div>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Form.Item
                    name="title"
                    label="Talimat Adı"
                    rules={[{required: true, message: 'Lütfen talimat adını giriniz'}]}
                >
                    <Input placeholder="Talimat adını giriniz"/>
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Açıklama"
                    rules={[{required: true, message: 'Lütfen açıklama giriniz'}]}
                >
                    <Input.TextArea rows={4} placeholder="Açıklama giriniz"/>
                </Form.Item>

                {/* Machines Section */}
                <div className="section-header"
                     style={{marginBottom: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 8}}>
                    <h3>Makine Bilgileri</h3>
                    <Button type="dashed" onClick={handleAddMachine} block>
                        + Makine Ekle
                    </Button>
                </div>

                {productionToMachines.map((machine, index) => (
                    <div key={index} style={{marginBottom: 16}}>
                        <Row align="middle" gutter={8}>
                            <Col span={24}>
                                <Form.Item
                                    label={`${index + 1}. İşlem Makinesi`}
                                    required
                                    style={{marginBottom: 8}}
                                >
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <Select
                                            style={{flex: 1}}
                                            placeholder="Makine seçiniz"
                                            value={machine.machineId || undefined}
                                            onChange={(value) => handleMachineChange(value, index)}
                                        >
                                            {machines.map(m => (
                                                <Select.Option key={m.id} value={m.id}>{m.name}</Select.Option>
                                            ))}
                                        </Select>
                                        <Button
                                            type="link"
                                            danger
                                            onClick={() => handleRemoveMachine(index)}
                                            style={{
                                                background: "#f35757",
                                                marginLeft: 10,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: 32
                                            }}
                                        >
                                            <MdDeleteForever color={"white"}/>
                                        </Button>
                                    </div>
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                ))}

                {/* Production Stores Section (previously semiFinishedProducts) */}
                <div className="section-header"
                     style={{marginTop: 24, marginBottom: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 8}}>
                    <h3>Üretim Yarı Mamül Bilgileri</h3>
                    <Button type="dashed" onClick={handleAddProductionStore} block>
                        + Yarı Mamül Ekle
                    </Button>
                </div>

                {productionStores.map((store, index) => (
                    <div key={index} style={{marginBottom: 16}}>
                        <Row align="middle" gutter={8}>
                            <Col span={24}>
                                <Form.Item
                                    label={`${index + 1}. Yarı Mamül`}
                                    required
                                    style={{marginBottom: 0}}
                                >
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <Input
                                            style={{flex: 1, marginRight: 8}}
                                            placeholder="Ürün adı"
                                            value={store.name}
                                            onChange={(e) => handleProductionStoreChange('name', e.target.value, index)}
                                        />
                                        <Input
                                            style={{flex: 1}}
                                            placeholder="Ürün barkodu"
                                            value={store.barkod}
                                            onChange={(e) => handleProductionStoreChange('barkod', e.target.value, index)}
                                        />
                                        <Button
                                            type="link"
                                            danger
                                            onClick={() => handleRemoveProductionStore(index)}
                                            style={{
                                                background: "#f35757",
                                                marginLeft: 10,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: 32
                                            }}
                                        >
                                            <MdDeleteForever color={"white"}/>
                                        </Button>
                                    </div>
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                ))}

                <Form.Item style={{marginTop: 24}}>
                    <Button type="primary" htmlType="submit">
                        Kaydet
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
};

export default ProductionInstructionInsert;