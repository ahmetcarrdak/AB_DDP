import React, { memo } from "react";
import { Link } from "react-router-dom";

const NotFoundScreen = memo(() => {
    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <h1>404</h1>
                <h2>Sayfa Bulunamadı</h2>
                <p>
                    Aradığınız sayfa mevcut değil ya da taşınmış olabilir.
                    <br />
                    Ana sayfaya geri dönmek için aşağıdaki butona tıklayabilirsiniz.
                </p>
                <Link to="/" className="back-home-btn">
                    Ana Sayfaya Dön
                </Link>
            </div>
        </div>
    );
});

export default NotFoundScreen;
