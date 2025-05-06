import React from "react";

import {RxDashboard} from "react-icons/rx";
import {HiOutlineBuildingOffice} from "react-icons/hi2";
import {IoPersonOutline} from "react-icons/io5";
import {GoArchive} from "react-icons/go";
import {FcProcess} from "react-icons/fc";
import {FaNetworkWired, FaCogs, FaTools} from "react-icons/fa";
import {FiDatabase} from "react-icons/fi";
import {CgController} from "react-icons/cg";

export const domain = "https://abddpapi-production.up.railway.app/api/";

export const apiUrl = {
    person: "Person/all",
    personById: (id: string) => `Person/${id}`,
    createPerson: "Person/create",
    updatePerson: "Person/update",
    collectiveUpdatePerson: "Person/collective-update",
    importPersonExcel: "Person/import-from-excel",
    personCollectiveUpdate: "Person/collective-update",
    deletePerson: "Person/delete",
    updateTermination: "Person/termination",

    positions: "Positions",

    store: "Store/all",
    storeById: (id: string) => `Store/${id}`,
    createStore: "Store",
    updateStore: "Store/update",

    order: "Order/all",
    orderById: (id: string) => `Order/${id}`,
    createOrder: "Order",
    updateOrder: "Order",
    cancelOrder: "Order/cancel",
    deleteOrder: "Order/delete",
    orderStatuses: "Order/statuses",
    topPendingStations: "station/top-pending-stations",

    work: "Work/all",
    workById: (id: string) => `Work/${id}`,
    createWork: "Work",
    updateWork: "Work",

    station: "Station/GetAll",
    stages: "Stages",
    stationInfoOrder: "Order/StationInfo",
    stationInfoWork: "Work/StationInfo",

    qualityControl: "QualityControlRecord/GetAll",
    qualityControlById: (id: string) => `QualityControlRecord/${id}`,
    createQualityControl: "QualityControlRecord/Create",
    updateQualityControl: "QualityControlRecord/Update",

    machine: "Machine",
    machineFault5: "MachineFault/TotalFault5",
    machineLatestFault: "MachineFault/latest-faults",
    machineFault: "MachineFault",
    machineById: (id: string) => `Machine/${id}`,

    maintenanceRecord: "MaintenanceRecord",

    authCompanyLogin: domain + "Auth/company/login",
    authPersonLogin: domain + "Auth/person/login",
    authCompanyRegister: domain + "Auth/register",

    ProductionIns: "ProductionInstruction/create",
    ProductionInsList: "ProductionInstruction/company-instructions",
    ProductionInsProcess: "ProductionInstruction/process",
    ProductionInsDetail: "ProductionInstruction/detail",
    ProductionInsUpdate: "ProductionInstruction/update",
    ProductionInsDelete: "ProductionInstruction/delete",
    MachineOperations: "ProductionInstruction"
};


const icons = {
    dashboard: <RxDashboard className="menu-item-icon"/>,
    depo: <FiDatabase className="menu-item-icon"/>,
    firmaSettings: <HiOutlineBuildingOffice className="menu-item-icon"/>,
    personelYönetim: <IoPersonOutline className="menu-item-icon"/>,
    malzemeYönetim: <GoArchive className="menu-item-icon"/>,
    işYönetim: <FaNetworkWired className="menu-item-icon"/>,
    siparişYönetim: <FcProcess className="menu-item-icon"/>,
    control: <CgController className="menu-item-icon"/>,
    makineYönetim: <FaCogs className="menu-item-icon"/>,
    bakımKayit: <FaTools className="menu-item-icon"/>,
};


export const menus = [
    {
        id: 1,
        title: "Panel",
        icon: icons.dashboard,
        action: "/",
    },
    {
        id: 3,
        title: "Üretim Yönetim",
        icon: icons.siparişYönetim,
        action: "#",
        subMenu: [
            {id: 3.1, title: "Üretim Talimatları", action: "/production-instructions"},
            {id: 3.2, title: "Üretim Durumları", action: "/production-tracker"},
        ],
    },
    {
        id: 2,
        title: "Makine Yönetim",
        icon: icons.makineYönetim,
        action: "#",
        subMenu: [
            {id: 3.1, title: "Makine Yönetim", action: "/machine"},
            {id: 3.2, title: "Silinen Makineler", action: "/deleted-machine"},
        ],
    },
]
export const searchs = [
    {
        id: 1,
        title: "Yönetim Paneli",
        description: "Ana yönetim paneli için tıklayın",
        action: "/",
        icon: icons.dashboard,
    },
    {
        id: 2,
        title: "Depo İşlemleri",
        description: "Depo işlemleri için tıklayın",
        action: "/store",
        icon: icons.depo,
    },
    {
        id: 3,
        title: "Firma Ayarları",
        description: "Firma özelliklerini düzenleyin",
        action: "/company-settings",
        icon: icons.firmaSettings,
    },
    {
        id: 4,
        title: "Personel Yönetimi",
        description: "Personel listesini ve işlemlerini düzenleyin",
        action: "/person",
        icon: icons.personelYönetim,
    },
    {
        id: 5,
        title: "Malzeme Yönetimi",
        description: "Malzeme listesini ve işlemlerini düzenleyin",
        action: "/material",
        icon: icons.malzemeYönetim,
    },
    {
        id: 6,
        title: "Sipariş Yönetimi",
        description: "Sipariş listesini ve işlemlerini düzenleyin",
        action: "/order",
        icon: icons.siparişYönetim,
    },
];

export const navMenus = [
    {
        id: 1,
        title: "Genel Bakış",
    },
    {
        id: 2,
        title: "Üretim Durumları",
    },
];
