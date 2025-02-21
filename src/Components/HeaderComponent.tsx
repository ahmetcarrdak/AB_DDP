import React, {memo, useState, useEffect} from 'react';
import {MdHomeFilled, MdWidgets} from "react-icons/md";
import {CiStar} from "react-icons/ci";
import {HiOutlineDotsHorizontal} from "react-icons/hi";
import {IoIosSearch} from "react-icons/io";
import {
    IoChatbubblesOutline,
    IoMailOutline,
    IoSettings,
    IoWarningOutline
} from "react-icons/io5";
import {Link, useLocation} from "react-router-dom"; // useLocation eklendi
import {searchs, navMenus} from "../Settings";

interface HeaderComponentProps {
    onMenuClick?: (id: number) => void; // Hamburger menüsü tıklama işlevi, id parametresi alacak
  }
  
  const HeaderComponent: React.FC<HeaderComponentProps> = ({ onMenuClick = () => {} }) => {
  
    const [searchTerm, setSearchTerm] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState<number>(1);
    const [activeDotsModal, setActiveDotsModal] = useState(false);
    const location = useLocation(); // Mevcut yolu kontrol etmek için useLocation

    const handleMenuClick = (menuId: number) => {
        setActiveMenuId(menuId);
    };

    const filteredSearches = searchs.filter((search) =>
        search.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDotsActive = () => {
        setActiveDotsModal(!activeDotsModal);
    };

    useEffect(() => {
        const handleDocumentClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.closest(".header-left-modal")) {
                return;
            }
            setActiveDotsModal(false);
        };
        document.addEventListener("click", handleDocumentClick);
        return () => {
            document.removeEventListener("click", handleDocumentClick);
        };
    }, []);

    return (
        <div className={"header-component"}>
            <div className="menu-header-nav">
                <MdHomeFilled/> / Dashboard {location.pathname}
            </div>
            <div className="header-body">
                <div className="header-body-left">
                    <MdWidgets/>
                    <span className={"header-body-title"}>
                        x-Firması-Kontrol-Paneli
                    </span>
                    <CiStar style={{paddingLeft: 10}}/>
                    <div className="header-left-modal">
                        <HiOutlineDotsHorizontal
                            style={{paddingLeft: 10, cursor: "pointer"}}
                            onClick={handleDotsActive}
                        />

                        {activeDotsModal && (
                            <div className={"header-dots-active-modal"}>
                                <div className="header-dots-active-modal-item">
                                    <span className="icon"><IoChatbubblesOutline/></span>
                                    <span>Panel tasarımcısı ile iletişim</span>
                                </div>
                                <div className="header-dots-active-modal-item">
                                    <span className="icon"><IoWarningOutline/></span>
                                    <span>Şikayet bildir</span>
                                </div>
                                <div className="header-dots-active-modal-item">
                                    <span className="icon"><IoMailOutline/></span>
                                    <span>Genel sorular için bize ulaşın</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="header-body-right">
                    <div className="header-input-container">
                        <IoIosSearch/>
                        <input
                            type="text"
                            className="header-input"
                            placeholder="Ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setTimeout(() => setIsFocused(false), 100)}
                        />
                    </div>

                    {isFocused && (
                        <div className="header-search-container">
                            {filteredSearches.length > 0 ? (
                                filteredSearches.map((search) => (
                                    <Link to={search.action} key={search.id}>
                                        <div className="header-search-container-item">
                                            <div className="menu-search-container-item-icon-container">
                                                {search.icon}
                                            </div>
                                            <div className="header-search-container-item-desc-container">
                                                <div className="header-search-title">{search.title}</div>
                                                <div className="header-search-description">
                                                    {search.description}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="header-search-no-results">
                                    Arama sonucu bulunamadı.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="header-footer">
                {location.pathname === "/" && (
                    <>
                        <div className="header-footer-item">
                            <IoSettings/>
                        </div>
                        {navMenus.map((menu) => (
                            <div
                                className={`header-footer-item ${activeMenuId === menu.id ? "active" : ""}`}
                                key={menu.id}
                                onClick={() => { 
                                    handleMenuClick(menu.id); 
                                    onMenuClick(menu.id); 
                                  }}
                            >
                                <span>{menu.title}</span>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default HeaderComponent;
