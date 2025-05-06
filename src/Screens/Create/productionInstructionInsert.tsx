import React, {useState, useEffect} from 'react';
import {Form, Input, Button, Select, message, Row, Col, Card} from 'antd';
import {MdDeleteForever} from "react-icons/md";
import {apiUrl} from "../../Settings";
import HeaderComponent from "../../Components/HeaderComponent";
import type {Dayjs} from 'dayjs';
import apiClient from "../../Utils/ApiClient";
import {toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Machine {
    id: number;
    name: string;
    barcode: string;
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
    barcode?: string;
    count: number;
}

interface ProdutionInstructionProps {
    onToggleMenu: () => void;
}

const ProductionInstructionInsert: React.FC<ProdutionInstructionProps> = ({onToggleMenu}) => {
    const [form] = Form.useForm();
    const [machines, setMachines] = useState<Machine[]>([]);
    const [productionToMachines, setProductionToMachines] = useState<ProductionToMachine[]>([]);
    const [productionStores, setProductionStores] = useState<ProductionStore[]>([]);
    const [barcode, setBarcode] = useState<string>('');
    const [isBarcodeDisabled, setIsBarcodeDisabled] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
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

    const generateBarcode = () => {
        const newBarcode = `BC-${Math.floor(100000 + Math.random() * 900000)}`;
        setBarcode(newBarcode);
        setIsBarcodeDisabled(true);
    };

    const refreshBarcode = () => {
        const newBarcode = `BC-${Math.floor(100000 + Math.random() * 900000)}`;
        setBarcode(newBarcode);
    };

    const cancelBarcode = () => {
        setBarcode('');
        setIsBarcodeDisabled(false);
    };

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
        const reorderedMachines = newMachines.map((machine, idx) => ({
            ...machine,
            line: idx + 1
        }));
        setProductionToMachines(reorderedMachines);
    };

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
        setLoading(true);
        try {
            const payload: ProductionInstruction = {
                title: values.title,
                description: values.description,
                productionToMachines: productionToMachines,
                productionStores: productionStores.map(store => ({
                    name: store.name,
                    barkod: store.barkod
                })),
                barcode: barcode,
                count: values.count
            };
            await apiClient.post(apiUrl.ProductionIns, payload);
            toast.success('Üretim talimatı başarıyla kaydedildi');
            form.resetFields();
            setProductionToMachines([]);
            setProductionStores([]);
            setBarcode('');
            setIsBarcodeDisabled(false);
            setLoading(false);
        } catch (error) {
            message.error('Kayıt sırasında bir hata oluştu');
        }
    };

    return (
        <>
            <HeaderComponent onToggleMenu={onToggleMenu}/>
            <ToastContainer/>
            <div style={{padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh'}}>
                <Card
                    title="Üretim Talimatı Oluştur"
                    style={{maxWidth: 1200, margin: '0 auto'}}
                    headStyle={{fontSize: '20px', fontWeight: 'bold', borderBottom: '1px solid #f0f0f0'}}
                >
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
                            label="Üretim Talimatı Barkodu"
                        >
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <Input
                                    placeholder="Barkod numarası"
                                    value={barcode}
                                    onChange={(e) => setBarcode(e.target.value)}
                                    disabled={isBarcodeDisabled}
                                    style={{flex: 1}}
                                />
                                {!isBarcodeDisabled && (
                                    <Button type="primary" onClick={generateBarcode}>
                                        Otomatik Oluştur
                                    </Button>
                                )}
                                {isBarcodeDisabled && (
                                    <>
                                        <Button type="default" onClick={refreshBarcode}>
                                            Yenile
                                        </Button>
                                        <Button type="default" danger onClick={cancelBarcode}>
                                            İptal
                                        </Button>
                                    </>
                                )}
                            </div>
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="Açıklama"
                            rules={[{required: true, message: 'Lütfen açıklama giriniz'}]}
                        >
                            <Input.TextArea rows={4} placeholder="Açıklama giriniz"/>
                        </Form.Item>

                        <Form.Item
                            name="count"
                            label="Üretilecek Adet"
                            rules={[{required: true, message: 'Lütfen adet giriniz'}]}
                        >
                            <Input placeholder={"Adet Giriniz"} type="number"></Input>
                        </Form.Item>

                        {/* Machines Section */}
                        <Card
                            title="Makine Bilgileri"
                            style={{marginBottom: 24}}
                            extra={
                                <Button type="dashed" onClick={handleAddMachine}>
                                    + Makine Ekle
                                </Button>
                            }
                        >
                            {productionToMachines.map((machine, index) => (
                                <div key={index} style={{marginBottom: 16}}>
                                    <Row align="middle" gutter={8}>
                                        <Col span={24}>
                                            <Form.Item
                                                label={`${index + 1}. İşlem Makinesi`}
                                                required
                                                style={{marginBottom: 8}}
                                            >
                                                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                                    <Select
                                                        style={{flex: 1}}
                                                        placeholder="Makine seçiniz (ad veya barkod ile arayın)"
                                                        value={machine.machineId || undefined}
                                                        onChange={(value) => handleMachineChange(value, index)}
                                                        showSearch
                                                        optionFilterProp="children"
                                                        //@ts-ignore
                                                        filterOption={(input, option) => {
                                                            if (!option || !option.children) return false;
                                                            const machineData = machines.find(m => m.id === option.value);
                                                            const searchText = input.toLowerCase();
                                                            return (
                                                                machineData?.name.toLowerCase().includes(searchText) ||
                                                                machineData?.barcode.toLowerCase().includes(searchText)
                                                            );
                                                        }}
                                                    >
                                                        {machines.map(m => (
                                                            <Select.Option key={m.id} value={m.id}>
                                                                <div>
                                                                    <div>{m.name}</div>
                                                                    <div style={{
                                                                        fontSize: '12px',
                                                                        color: '#888'
                                                                    }}>Barkod: {m.barcode}</div>
                                                                </div>
                                                            </Select.Option>
                                                        ))}
                                                    </Select>
                                                    <Button
                                                        type="primary"
                                                        danger
                                                        onClick={() => handleRemoveMachine(index)}
                                                        icon={<MdDeleteForever/>}
                                                    />
                                                </div>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </div>
                            ))}
                        </Card>

                        {/* Production Stores Section */}
                        <Card
                            title="Üretim Yarı Mamül Bilgileri"
                            style={{marginBottom: 24}}
                            extra={
                                <Button type="dashed" onClick={handleAddProductionStore}>
                                    + Yarı Mamül Ekle
                                </Button>
                            }
                        >
                            {productionStores.map((store, index) => (
                                <div key={index} style={{marginBottom: 16}}>
                                    <Row align="middle" gutter={8}>
                                        <Col span={24}>
                                            <Form.Item
                                                label={`${index + 1}. Yarı Mamül`}
                                                required
                                                style={{marginBottom: 0}}
                                            >
                                                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                                    <Input
                                                        placeholder="Ürün adı"
                                                        value={store.name}
                                                        onChange={(e) => handleProductionStoreChange('name', e.target.value, index)}
                                                        style={{flex: 1}}
                                                    />
                                                    <Input
                                                        placeholder="Ürün barkodu"
                                                        value={store.barkod}
                                                        onChange={(e) => handleProductionStoreChange('barkod', e.target.value, index)}
                                                        style={{flex: 1}}
                                                    />
                                                    <Button
                                                        type="primary"
                                                        danger
                                                        onClick={() => handleRemoveProductionStore(index)}
                                                        icon={<MdDeleteForever/>}
                                                    />
                                                </div>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </div>
                            ))}
                        </Card>

                        <Form.Item style={{marginTop: 24}}>
                            <Button type="primary" htmlType="submit" size="large" loading={loading}>
                                Kaydet
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </>
    );
};

export default ProductionInstructionInsert;