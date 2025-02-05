import React, {useEffect, useState} from "react";
import {startSignalRConnection, subscribeToDataUpdates} from "./signalRService";
import {toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DataUpdateComponent: React.FC = () => {
    const [data, setData] = useState<string>("");

    useEffect(() => {
        startSignalRConnection();
        subscribeToDataUpdates((newData) => {
            console.log("Gelen Veri:", newData);
            toast.success(newData, {
                position: "bottom-right",
                autoClose: 3000,
                theme: "colored",
            });
            setData(newData);
        });
    }, []);

    return null;
};

export default DataUpdateComponent;
