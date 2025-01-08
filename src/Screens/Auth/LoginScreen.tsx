import React, {memo} from 'react';
import logo from "./../../Images/logo.webp"

const LoginScreen = memo(() => {
    return (
        <div className="auth-container">
            <div className="auth-background">
                <div className="auth-content">
                    <img
                        src={logo}
                        alt="Logo"
                        className="auth-logo"
                    />
                    <h1 className="auth-title">Giriş yap</h1>
                    <form className="auth-form">
                        <input
                            type="text"
                            placeholder="Telefon numarası yada E-mail"
                            className="auth-input"
                        />
                        <div className="auth-links">
                            <a href="/forgot-password" className="auth-forgot">Şifremi unuttum</a>
                        </div>
                        <input
                            type="password"
                            placeholder="Şifre"
                            className="auth-input"
                        />
                        <button
                            type="submit"
                            className="auth-button"
                        >
                            Giriş
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
})
export default LoginScreen;
