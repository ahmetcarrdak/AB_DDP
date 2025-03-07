import React from "react";

import {RxDashboard} from "react-icons/rx";
import {HiOutlineBuildingOffice} from "react-icons/hi2";
import {IoPersonOutline} from "react-icons/io5";
import {GoArchive} from "react-icons/go";
import {FcProcess} from "react-icons/fc";
import {FaNetworkWired, FaCogs, FaTools} from "react-icons/fa";
import {FiDatabase} from "react-icons/fi";
import {CgController} from "react-icons/cg";

export const domain = "http://localhost:5262/api/";

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

    maintenanceRecord: "MaintenanceRecord",

    authCompanyLogin: domain + "Auth/company/login",
    authPersonLogin: domain + "Auth/person/login",
    authCompanyRegister: domain + "Auth/register"
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
        title: "Personel Yönetim",
        icon: icons.personelYönetim,
        action: "/person",
    },
    {
        id: 2,
        title: "Üretim Yönetim",
        icon: icons.depo,
        action: "#",
        subMenu: [
            {id: 2.1, title: "Depolar yönet", action: "/store"},
            {id: 2.2, title: "İş emirlerini yönet", action: "/work"},
            {id: 2.3, title: "Yarı Mamül üretim durumları", action: "/work-status"},
        ],
    },
    {
        id: 5,
        title: "Sipariş Yönetim",
        icon: icons.siparişYönetim,
        action: "#",
        subMenu: [
            {id: 5.1, title: "Siparişleri yönet", action: "/order"},
            {id: 5.3, title: "Sipariş durumları", action: "/order-status"},
            {id: 5.2, title: "Kalite Kontrol", action: "/quality-control"},
        ],
    },
    {
        id: 4,
        title: "Makine Yönetim",
        icon: icons.makineYönetim,
        action: "#",
        subMenu: [
            {id: 4.1, title: "Makineleri yönet", action: "/machine"},
            {id: 4.2, title: "Arızaları Yönet", action: "/machine-fault"},
            {id: 4.3, title: "Bakım Kayıtları", action: "/maintenance-record"},
        ],
    },
];

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
        title: "Sipariş Durumları",
    },
    {
        id: 3,
        title: "Yarı Mamül Durumları",
    },
];
