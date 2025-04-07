import React, {useState, useEffect} from 'react';
import {MdHome, MdGridView} from "react-icons/md";
import {RiSearchLine, RiArrowRightLine} from "react-icons/ri";
import {Link, useLocation} from "react-router-dom";
import {searchs} from "../Settings";

interface HeaderComponentProps {
    onMenuClick?: (id: number) => void;
    onToggleMenu?: () => void;
    activeTab?: number;
}

const HeaderComponent: React.FC<HeaderComponentProps> = ({
                                                             onMenuClick = () => {
                                                             },
                                                             onToggleMenu = () => {
                                                             },
                                                             activeTab = 1
                                                         }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const location = useLocation();

    const filteredSuggestions = searchs.filter(suggestion =>
        suggestion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        suggestion.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleMenuClick = (menuId: number) => {
        onMenuClick(menuId);
    };

    return (
        <header className="header-container">
            <div className="header-top">
                <div className="header-left">
                    <button onClick={onToggleMenu} className="menu-button">
                        <MdGridView/>
                    </button>

                    <div className="breadcrumb">
                        <MdHome className="home-icon"/>
                        <span>/</span>
                        <span>Dashboard</span>
                    </div>
                </div>
            </div>

            {location.pathname === "/" && (
                <div className="header-tabs">
                    <button
                        className={`tab-button ${activeTab === 1 ? 'active' : ''}`}
                        onClick={() => handleMenuClick(1)}
                    >
                        Genel Bakış
                    </button>
                    <button
                        className={`tab-button ${activeTab === 2 ? 'active' : ''}`}
                        onClick={() => handleMenuClick(2)}
                    >
                        Üretim Durumları
                    </button>
                </div>
            )}

        </header>
    );
};

export default HeaderComponent;