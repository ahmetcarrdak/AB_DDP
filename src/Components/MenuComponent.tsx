import React, {memo, useState, useEffect, useRef} from "react";
import {Link} from "react-router-dom";

// React Icons - Bs (Bootstrap)
import {BsFillInfoSquareFill} from "react-icons/bs";

// React Icons - Ci (Circum Icons)
import {CiSearch} from "react-icons/ci";

// React Icons - Fa (Font Awesome)
import {FaBook} from "react-icons/fa6";
import {FaNetworkWired} from "react-icons/fa";

// React Icons - Fi (Feather Icons)
import {FiDatabase, FiSidebar, FiTerminal} from "react-icons/fi";

// React Icons - Io (Ionicons)
import {
    IoIosArrowForward,
    IoIosNotifications,
    IoMdArrowDropdown,
} from "react-icons/io";
import {IoPersonOutline, IoSettings} from "react-icons/io5";

// React Icons - Md (Material Design)
import {MdEmojiEmotions, MdKeyboardCommandKey} from "react-icons/md";

// React Icons - Ri (Remix Icon)
import {RiLogoutCircleRLine} from "react-icons/ri";

// React Icons - Rx (Radix Icons)
import {RxDashboard} from "react-icons/rx";


import {menus} from "../Settings";

import logo from "./../Images/logo.webp";

const MenuComponent = memo(() => {
    const [isMenu, setMenu] = useState(true);
    const [isMenuBody, setMenuBody] = useState(true);
    const [activeMenu, setActiveMenu] = useState<number | null>(null);
    const [activeSubMenu, setActiveSubMenu] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState(""); // Arama metnini tutan state
    const searchInputRef = useRef<HTMLInputElement | null>(null); // input elementine referans
    const [isLogoutContainer, setLogoutContainer] = useState(false);


    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.metaKey && event.key === 'b') { // Command (Mac) + B tuşu kontrolü
                event.preventDefault(); // Varsayılan davranışı engelle
                if (searchInputRef.current) {
                    searchInputRef.current.focus(); // Input elemanına odaklan
                }
                if (!isMenuBody) {
                    console.log("isMenuBody öncesi:", isMenuBody); // Durumu kontrol edin
                    setMenuBody(true);
                    console.log("isMenuBody sonrası:", isMenuBody); // Durumu kontrol edin
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown); // Event listener ekle

        return () => {
            window.removeEventListener("keydown", handleKeyDown); // Temizlik yap
        };
    }, [isMenuBody]);

    const handleMenuClick = (menuId: number) => {
        setActiveMenu(activeMenu === menuId ? null : menuId);
        setActiveSubMenu(null);
    };

    const handleSubMenuClick = (subMenuId: number) => {
        setActiveSubMenu(subMenuId);
    };

    const handleMenuControl = () => {
        setMenu(!isMenu);
    };

    const handleMenuBody = () => {
        setMenuBody(!isMenuBody);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value.toLowerCase()); // Arama terimi küçük harfe dönüştürülerek kaydedilir
    };

    // Menü öğelerini arama terimine göre filtrele
    const filteredMenus = menus.filter((menu) =>
        menu.title.toLowerCase().includes(searchTerm) || // Menü başlığı arama terimiyle eşleşiyorsa
        (menu.subMenu && menu.subMenu.some(sub => sub.title.toLowerCase().includes(searchTerm))) // Alt menülerdeki başlıkları kontrol et
    );

    return (
        <>
            <div className="menuHeader">
                <div className="menuHeaderLeft">
                    <img src={logo} alt="" className="logo"/>
                    <label htmlFor="">Business</label>
                </div>
                <div className="menuHeaderRight" onClick={handleMenuControl}>
                    <FiSidebar/>
                </div>
            </div>
            <div className="menuBody">
                <div className="menuSearchContainer">
                    <CiSearch className="menuSearchIcon"/>
                    <input
                        type="text"
                        placeholder="Search"
                        ref={searchInputRef}
                        value={searchTerm}
                        onChange={handleSearchChange} // Arama kutusundaki değişiklikleri yakala
                    />
                    <div className="menu-search-icons">
                        <MdKeyboardCommandKey/> B
                    </div>
                </div>

                <div className="menu-widgets">
                    <Link to={"/"} className="menu-widget">
                        <RxDashboard className="menu-widget-icon"/>
                        <span className="menu-widget-badge">Panel</span>
                    </Link>

                    <Link to={"/store"} className="menu-widget">
                        <FiDatabase className="menu-widget-icon"/>
                        <span className="menu-widget-badge">Depo</span>
                    </Link>

                    <Link to={"/order"} className="menu-widget">
                        <FaNetworkWired className="menu-widget-icon"/>
                        <span className="menu-widget-badge">Siparişler</span>
                    </Link>

                    <Link to={"/person"} className="menu-widget">
                        <IoPersonOutline className="menu-widget-icon"/>
                        <span className="menu-widget-badge">Personeller</span>
                    </Link>
                </div>

                {/* Menü Başlıkları */}
                <div className="menu-items-dropdown" onClick={handleMenuBody}>
                    <IoMdArrowDropdown className={`${!isMenuBody && "rotate"}`}/> Menü
                </div>

                <div className={`menu-items ${isMenuBody && "active"}`}>
                    {filteredMenus.map((menu) => (
                        <div key={menu.id} className={`menu-item-container ${
                            activeMenu === menu.id ? "active" : ""
                        }`}>
                            <Link to={menu.action}>
                                <div
                                    className="menu-item"
                                    onClick={() => handleMenuClick(menu.id)}
                                >
                                    {menu.icon}
                                    {menu.title}
                                    {menu.subMenu && (
                                        <IoIosArrowForward
                                            className={`menu-item-icon ${
                                                activeMenu === menu.id ? "active" : ""
                                            }`}
                                        />
                                    )}
                                </div>
                            </Link>

                            {/* Alt Menü */}
                            {activeMenu === menu.id && menu.subMenu && (
                                <ul className={`menu-item-list-container ${
                                    activeMenu === menu.id ? "active" : ""
                                }`}>
                                    {menu.subMenu.map((sub) => (
                                        <Link
                                            to={sub.action}
                                            key={sub.id}
                                            className="menu-link"
                                        >
                                            <li
                                                className={`sub-menu-item ${
                                                    activeSubMenu === sub.id ? "active" : ""
                                                }`}
                                                onClick={() => handleSubMenuClick(sub.id)} // Alt menü tıklandığında aktif et
                                            >
                                                {sub.title}
                                            </li>
                                        </Link>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
                <div className="menu-footer">
                    <div className="menu-footer-icons">
                        <div className="menu-footer-item">
                            <Link to={""}>
                                <FiTerminal/>
                            </Link>
                        </div>
                        <div className="menu-footer-item">
                            <Link to={""}>
                                <FaBook/>
                            </Link>
                        </div>
                        <div className="menu-footer-item">
                            <Link to={""}>
                                <div className="menu-footer-notification">1</div>
                                <IoIosNotifications/>
                            </Link>
                        </div>
                        <div className="menu-footer-item">
                            <Link to={""}>
                                <IoSettings/>
                            </Link>
                        </div>
                        <div className="menu-footer-item">
                            <Link to={""}>
                                <BsFillInfoSquareFill/>
                            </Link>
                        </div>
                        <div className="menu-footer-item">
                            <Link to={""}>
                                <MdEmojiEmotions/>
                            </Link>
                        </div>
                    </div>
                    <div className="menu-profile">
                        <div className={"menu-footer-profile-left"}>
                            <img
                                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqSTTueKdjM4z7B0u5Gqx5UFUZjqtL3_8QhQ&s"
                                alt=""
                                className={"menu-profile-photo"}
                            />
                            <div className={"menu-profile-left-label"}>
                                <div>Jhon Doe</div>
                                <div>Human resources</div>
                            </div>
                        </div>
                        <RiLogoutCircleRLine
                            style={{color: "#F57A7A"}}
                            onClick={() => setLogoutContainer(true)}
                        />
                    </div>
                </div>
            </div>

            {isLogoutContainer &&
                (<div className="logoutContainer">
                    <div className="logoutContainer-card">
                        <div className="logoutContainer-title">Çıkış Yap</div>
                        <div className="logoutContainer-text">
                            Güvenli bir şekilde cikmak istediğinizden emin misiniz?
                        </div>
                        <div className="logoutContainer-buttons">
                            <button className="logoutContainer-cancel"
                                    onClick={() => setLogoutContainer(false)}
                            >Vazgeç
                            </button>
                            <button className="logoutContainer-logout">Çıkış Yap</button>
                        </div>
                    </div>
                </div>)
            }

        </>
    );
});

export default MenuComponent;
