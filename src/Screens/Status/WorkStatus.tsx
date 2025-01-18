import React, { memo, useEffect, useState } from "react";
import { Select, Timeline, Card, Typography } from "antd";
import axios from "axios";
import { apiUrl } from "../../Settings";

const { Option } = Select;
const { Title } = Typography;

interface Station {
  stationId: number;
  name: string;
  description: string;
  orderNumber: number;
}

interface Work {
  workId: number;
  workDate: string;
  customerName: string;
  productName: string;
  stationId: number;
}

const WorkStatus = memo(() => {
  const [works, setWorks] = useState<Work[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [currentStation, setCurrentStation] = useState<number | null>(null);

  useEffect(() => {
    // Fetch stations
    const fetchStations = async () => {
      try {
        const response = await axios.get<Station[]>(apiUrl.station);
        setStations(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching stations:", error);
      }
    };

    // Fetch works
    const fetchWorks = async () => {
      try {
        const response = await axios.get<Work[]>(apiUrl.work);
        setWorks(response.data);
      } catch (error) {
        console.error("Error fetching works:", error);
      }
    };

    fetchStations();
    fetchWorks();
  }, []);

  const handleWorkChange = (workId: string) => {
    const work = works.find((w) => w.workId === parseInt(workId));
    setSelectedWork(work || null);
    setCurrentStation(work?.stationId || null);
  };

  const filterOption = (
    input: string,
    option?: { label: string; value: string }
  ) => {
    if (!option) return false;
    return option.label.toLowerCase().includes(input.toLowerCase());
  };

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>İş Durumu</Title>

      <Card style={{ marginBottom: "20px" }}>
        <Select
          style={{ width: "100%" }}
          placeholder="İş Seçiniz"
          onChange={handleWorkChange}
          showSearch
          filterOption={filterOption}
          options={works.map((work) => ({
            value: work.workId.toString(),
            label: `${work.workDate.substring(0, 10)} - ${
              work.customerName
            } - ${work.productName}`,
          }))}
        />
      </Card>

      {selectedWork && (
        <Timeline
          mode="alternate"
          items={stations
            .sort((a, b) => a.orderNumber - b.orderNumber)
            .map((station) => {
              const currentStationObj = stations.find(
                (s) => s.stationId === currentStation
              );
              const currentStationOrderNumber =
                currentStationObj?.orderNumber || 0;

              return {
                color:
                  station.stationId === currentStation
                    ? "blue"
                    : station.orderNumber < currentStationOrderNumber
                    ? "green"
                    : "gray",
                children: (
                  <div>
                    <h4>{station.name}</h4>
                    <p>{station.description}</p>
                  </div>
                ),
              };
            })}
        />
      )}
    </div>
  );
});

export default WorkStatus;
