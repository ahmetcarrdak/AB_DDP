import React, {memo} from 'react'
import HeaderComponent from "../Components/HeaderComponent";

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

const HomeScreen = memo(() => {
    const threatPreventionData = [{name: "High", value: 55}, {name: "Medium", value: 2}, {name: "Low", value: 30}];
    const threatDetectionData = [
        {name: "Device 1", High: 400, Medium: 240, Low: 240},
        {name: "Device 2", High: 300, Medium: 139, Low: 221},
        {name: "Device 3", High: 200, Medium: 980, Low: 229},
        {name: "Device 4", High: 278, Medium: 390, Low: 200},
        {name: "Device 5", High: 189, Medium: 480, Low: 218},
    ];
    const COLORS = ["#FF0000", "#FFA500", "#00FF00"];

    return (
        <>
            <HeaderComponent/>
            <div className="home-body">
                <div className="row">
                    <div className="card">
                        <h3>Siparişleriniz</h3>
                        <div className="chart-body">
                            <div className="cart-body-left">
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie data={threatPreventionData} dataKey="value" nameKey="name" cx="50%"
                                             cy="50%"
                                             innerRadius={50} outerRadius={80}>
                                            {threatPreventionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="cart-body-right">
                                <div className="chart-body-right-item">
                                    <div
                                        style={{width: 10, height: 10, borderRadius: 5, background: COLORS[0]}}
                                    ></div>
                                    <span style={{padding: "0 5px 0 5px"}}>Bekleyen:</span>
                                    {threatPreventionData[0].value}
                                </div>
                                <div className="chart-body-right-item">
                                    <div
                                        style={{width: 10, height: 10, borderRadius: 5, background: COLORS[1]}}
                                    ></div>
                                    <span style={{padding: "0 5px 0 5px"}}>Devam eden:</span>
                                    {threatPreventionData[1].value}
                                </div>
                                <div className="chart-body-right-item">
                                    <div
                                        style={{width: 10, height: 10, borderRadius: 5, background: COLORS[2]}}
                                    ></div>
                                    <span style={{padding: "0 5px 0 5px"}}>Biten:</span>
                                    {threatPreventionData[2].value}
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="card large">
                        <h3>Makine arıza geçmişi</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={threatDetectionData}>
                                <XAxis dataKey="name"/>
                                <YAxis/>
                                <Tooltip/>
                                <Line type="monotone" dataKey="High" stroke="#FF0000"/>
                                <Line type="monotone" dataKey="Medium" stroke="#FFA500"/>
                                <Line type="monotone" dataKey="Low" stroke="#00FF00"/>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="row">
                    <div className="card large">
                        <h3>Threat Detection</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={threatDetectionData}>
                                <XAxis dataKey="name"/>
                                <YAxis/>
                                <Tooltip/>
                                <Bar dataKey="High" stackId="a" fill="#FF0000"/>
                                <Bar dataKey="Medium" stackId="a" fill="#FFA500"/>
                                <Bar dataKey="Low" stackId="a" fill="#00FF00"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="card">
                        <h3>Most Attacked Devices</h3>
                        <div className="large-number">2852</div>
                        <p>SmartThermostat_2372</p>
                    </div>
                </div>
            </div>
        </>
    )
})
export default HomeScreen;
