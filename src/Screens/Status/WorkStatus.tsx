import React, { memo, useEffect, useState, useMemo } from "react";
import { Table, Card, Typography } from "antd";
import axios from "axios";
import { apiUrl } from "../../Settings";

const { Title, Text } = Typography;

interface Station {
  stationId: number;
  name: string;
  description: string;
  orderNumber: number;
}

interface Work {
  workId: number;
  workName: string;
  stagesId: number;
  description: string;
}

const WorkStatus = memo(() => {
  const [stations, setStations] = useState<Station[]>([]);
  const [worksByStation, setWorksByStation] = useState<{ [key: number]: Work[] }>({});
  const [selectedWork, setSelectedWork] = useState<Work | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Verileri çekme işlemi
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [stationsResponse, worksResponse] = await Promise.all([
          axios.get<Station[]>(apiUrl.station),
          axios.get<Work[]>(apiUrl.stationInfoWork),
        ]);

        // İstasyonları sırala
        const sortedStations = stationsResponse.data.sort((a, b) => a.orderNumber - b.orderNumber);
        setStations(sortedStations);

        // İşleri istasyonlara göre grupla
        const groupedWorks: { [key: number]: Work[] } = {};
        worksResponse.data.forEach((work) => {
          if (!groupedWorks[work.stagesId]) {
            groupedWorks[work.stagesId] = [];
          }
          groupedWorks[work.stagesId].push(work);
        });

        setWorksByStation(groupedWorks);
      } catch (error) {
        console.error("Veri çekme hatası:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Tablo sütunlarını oluştur
  const columns = useMemo(() => {
    return stations.map((station) => ({
      title: station.name,
      dataIndex: station.stationId,
      render: (works: Work[]) =>
          works && works.length > 0 ? (
              works.map((work) => (
                  <p
                      key={work.workId}
                      style={{ cursor: "pointer", color: "blue" }}
                      onClick={() => setSelectedWork(work)}
                  >
                    {work.workName}
                  </p>
              ))
          ) : (
              <Text>-</Text>
          ),
    }));
  }, [stations]);

  // Tablo verilerini oluştur
  const data = useMemo(() => {
    return Object.keys(worksByStation).map((stageId, index) => {
      const rowData: { [key: string]: any } = { key: index };
      stations.forEach((station) => {
        rowData[station.stationId] = worksByStation[parseInt(stageId)]?.filter(
            (work) => work.stagesId === station.stationId
        );
      });
      return rowData;
    });
  }, [worksByStation, stations]);

  return (
      <div style={{ padding: "20px" }}>
        <Title level={2}>İstasyonlar ve Yarı Mamüller</Title>
        {isLoading ? (
            <Card>
              <Text>Yükleniyor...</Text>
            </Card>
        ) : (
            <Table columns={columns} dataSource={data} pagination={false} bordered />
        )}
        {selectedWork && (
            <Card title={`İş Detayı - ${selectedWork.workName}`} style={{ marginTop: "20px" }}>
              <p>
                <strong>Açıklama:</strong> {selectedWork.description}
              </p>
            </Card>
        )}
      </div>
  );
});

export default WorkStatus;
