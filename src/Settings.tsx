import React from "react";

import {RxDashboard} from "react-icons/rx";
import {HiOutlineBuildingOffice} from "react-icons/hi2";
import {IoPersonOutline} from "react-icons/io5";
import {GoArchive} from "react-icons/go";
import {FcProcess} from "react-icons/fc";
import {FaNetworkWired} from "react-icons/fa";
import {FiDatabase} from "react-icons/fi";

const domain = "http://localhost:5262/api/";

export const apiUrl = {
    person : `${domain}Person/all`,
    store: `${domain}Store/all`,
    order: `${domain}Order/all`,
    work : `${domain}Work/all`
}

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
        id: 2,
        title: "Depo",
        icon: icons.depo,
        action: "/store",
    },
    {
        id: 3,
        title: "Firma Ayarları",
        icon: icons.firmaSettings,
        action: "/company-settings",
    },
    {
        id: 4,
        title: "Personel Yönetim",
        icon: icons.personelYönetim,
        action: "#",
        subMenu: [
            {id: 4.1, title: "Personelleri yönet", action: "/person"},
            {id: 4.2, title: "Peronel oluştur", action: "/person-create"},
        ],
    },
    {
        id: 5,
        title: "Malzeme Yönetim",
        icon: icons.malzemeYönetim,
        action: "#",
        subMenu: [
            {id: 5.1, title: "Malzemeleri yönet", action: "/material"},
            {id: 5.2, title: "Mazleme oluştur", action: "/material-add"},
        ],
    },
    {
        id: 6,
        title: "Sipariş Yönetim",
        icon: icons.siparişYönetim,
        action: "#",
        subMenu: [
            {id: 6.1, title: "Siparişleri yönet", action: "/order"},
            {id: 6.2, title: "Sipariş durumları", action: "/order-status"},
            {id: 6.3, title: "Sipariş oluştur", action: "/order-create"},
        ],
    },
    {
        id: 7,
        title: "İş Yönetim",
        icon: icons.işYönetim,
        action: "#",
        subMenu: [
            {id: 7.1, title: "İşleri yönet", action: "/work"},
            {id: 7.2, title: "İş durumları", action: "/work-status"},
            {id: 7.3, title: "İş oluştur", action: "/work-create"},
        ],
    },
];

export const searchs = [
    {
        id: 1,
        title: "Yönetim Paneli",
        description: "Ana yönetim paneli için tıklayın",
        action: "/",
        icon: icons.dashboard
    },
    {
        id: 2,
        title: "Depo İşlemleri",
        description: "Depo işlemleri için tıklayın",
        action: "/store",
        icon: icons.depo
    },
    {
        id: 3,
        title: "Firma Ayarları",
        description: "Firma özelliklerini düzenleyin",
        action: "/company-settings",
        icon: icons.firmaSettings
    },
    {
        id: 4,
        title: "Personel Yönetimi",
        description: "Personel listesini ve işlemlerini düzenleyin",
        action: "/person",
        icon: icons.personelYönetim
    },
    {
        id: 5,
        title: "Malzeme Yönetimi",
        description: "Malzeme listesini ve işlemlerini düzenleyin",
        action: "/material",
        icon: icons.malzemeYönetim
    },
    {
        id: 6,
        title: "Sipariş Yönetimi",
        description: "Sipariş listesini ve işlemlerini düzenleyin",
        action: "/order",
        icon: icons.siparişYönetim
    }
];

export const navMenus = [
    {
        id: 1,
        title: "Güvenlik"
    },
    {
        id: 2,
        title: "Genel Bakış"
    },
    {
        id: 3,
        title: "Girdiler"
    },
    {
        id: 4,
        title: "Çıktılar"
    },
    {
        id: 5,
        title: "Mesajlar"
    },
    {
        id: 6,
        title: "Ayarlar"
    }
];
