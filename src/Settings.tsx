import React from "react";

import {RxDashboard} from "react-icons/rx";
import {HiOutlineBuildingOffice} from "react-icons/hi2";
import {IoPersonOutline} from "react-icons/io5";
import {GoArchive} from "react-icons/go";
import {FcProcess} from "react-icons/fc";
import {FaNetworkWired} from "react-icons/fa";
import {FiDatabase} from "react-icons/fi";

export const domain = "http://localhost:5262/api/";

export const apiUrl = {
    person: `${domain}Person/all`,
    createPerson: `${domain}Person/create`,
    personById: `${domain}Person`,
    personUpdate: `${domain}Person/update`,

    positions: `${domain}Positions`,

    store: `${domain}Store/all`,
    storeById: `${domain}Store`,
    createStore: `${domain}Store`,
    storeUpdate: `${domain}Store/update`,

    order: `${domain}Order/all`,
    orderById: `${domain}Order`,
    createOrder: `${domain}Order/create`,
    orderUpdate: `${domain}Order`,
    orderCancel: `${domain}Order/cancel`,
    orderDelete: `${domain}Order/delete`,

    work: `${domain}Work/all`,
    workById: `${domain}Work`,
    createWork: `${domain}Work`,
    workUpdate: `${domain}Work`,

    station: `${domain}Station/GetAll`,
    stages: `${domain}Stages`,
    stationInfoOrder: `${domain}Order/StationInfo`,
    stationInfoWork: `${domain}Work/StationInfo`,
};

const icons = {
    dashboard: <RxDashboard className="menu-item-icon"/>,
    depo: <FiDatabase className="menu-item-icon"/>,
    firmaSettings: <HiOutlineBuildingOffice className="menu-item-icon"/>,
    personelYönetim: <IoPersonOutline className="menu-item-icon"/>,
    malzemeYönetim: <GoArchive className="menu-item-icon"/>,
    işYönetim: <FaNetworkWired className="menu-item-icon"/>,
    siparişYönetim: <FcProcess className="menu-item-icon"/>,
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
        title: "Depo Yönetim",
        icon: icons.depo,
        action: "#",
        subMenu: [
            {id: 2.1, title: "Depolar yönet", action: "/store"},
            {id: 2.2, title: "İş emirlerini yönet", action: "/work"},
            {id: 2.3, title: "Malzeme üretim durumları", action: "/work-status"},
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
        title: "Sipariş Durumları"
    },
    {
        id: 3,
        title: "Yarı Mamül Durumları"
    }
];
