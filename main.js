// main.js
const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
    // Yeni bir pencere oluştur
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"), // Preload script (isteğe bağlı)
            contextIsolation: true, // Güvenlik için önerilir
            enableRemoteModule: false, // Güvenlik için önerilir
        },
    });

    // React uygulamasını yükle
    mainWindow.loadURL(
        process.env.NODE_ENV === "development"
            ? "http://localhost:3000" // Geliştirme ortamında React sunucusu
            : `file://${path.join(__dirname, "public/index.html")}` // Production build
    );

    // Geliştirme araçlarını aç (sadece geliştirme ortamında)
    if (process.env.NODE_ENV === "development") {
        mainWindow.webContents.openDevTools();
    }
}

// Uygulama hazır olduğunda pencereyi oluştur
app.whenReady().then(() => {
    createWindow();

    // macOS için pencere yoksa yeni pencere aç
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Tüm pencereler kapatıldığında uygulamayı kapat (macOS hariç)
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
