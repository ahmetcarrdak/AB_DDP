import * as signalR from "@microsoft/signalr";

const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5262/api/Person/all")
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

export const startSignalRConnection = async () => {
    try {
        //await connection.start();
        console.log("SignalR bağlantısı başarılı!");
    } catch (err) {
        console.error("SignalR bağlantı hatası: ", err);
        //setTimeout(startSignalRConnection, 5000);
    }
};

export const subscribeToDataUpdates = (callback: (data: string) => void) => {
    connection.on("ReceiveDataUpdate", callback);
};

export default connection;
