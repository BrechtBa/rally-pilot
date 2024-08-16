import { useState } from "react";
import { Link } from "react-router-dom";

import { Button, Dialog } from "@mui/material";

import CsvDownloader from 'react-csv-downloader';

import MyMap from "@/components/Map";
import { historyUseCases } from "./factory";
import { AugmentedGPSPoint } from "./useCases";
import Item from "@/components/Item";
import Chart from "@/components/Chart";


function CsvPathExport({path}: {path: Array<AugmentedGPSPoint>}) {

  const makeCsvData = () => {

    return path.map((point) => ({
      date: point.date.toISOString(),
      time: point.time.toFixed(0),
      latitude: point.location.latitude.toFixed(9),
      longitude: point.location.longitude.toFixed(9),
      altitude: point.location.altitude.toFixed(1),
      distance: point.distance.toFixed(3),
      speed: point.speed.toFixed(1),
    }))
  }

  const columns = [{
    id: "date",
    displayName: 'Datetime'
  }, {
    id: "time",
    displayName: 'Time (s)'
  }, {
    id: "latitude",
    displayName: 'Latitude (°N)'
  }, {
    id: "longitude",
    displayName: 'Longitude (°E)'
  }, {
    id: "altitude",
    displayName: 'Altitude (m)'
  }, {
    id: "distance",
    displayName: 'Distance (km)'
  }, {
    id: "speed",
    displayName: 'Speed (km/h)'
  }];
  return (
    <CsvDownloader datas={makeCsvData} columns={columns} filename="downloaded-route.csv">
      <Button>Download</Button>
    </CsvDownloader>
  )
}


function HistoryViewControls({path, setPath}: {path: Array<AugmentedGPSPoint>, setPath: (reference: string) => void}) {

  const [listDialogOpen, setListDialogOpen] = useState<boolean>(false);
 
  return (
    <div style={{display: "flex", gap: "0.5em", marginTop: "1em", marginBottom: "0.5em", width: "100%", justifyContent: "center", flexWrap: "wrap"}}>

      <CsvPathExport path={path} />

      <div style={{maxWidth: "8em"}}>
        <Button onClick={() => setListDialogOpen(true)}>list</Button>
      </div>

      <Dialog open={listDialogOpen} onClose={() => setListDialogOpen(false)} fullScreen>
        <div style={{padding: "0.5em", height: "100%", display: "flex", flexDirection: "column" }}>
          <h3 style={{marginTop: 0}}>History</h3>
          <div style={{flexGrow: 1, overflowY: "scroll"}}>
            {historyUseCases.listPaths().map(item => (
              <Item key={item.reference} onClick={() => {setPath(item.reference); setListDialogOpen(false);}}>
                {item.date.toISOString()}
              </Item>
            ))} 
          </div>
          <div style={{display: "flex", justifyContent: "flex-end"}}>
            <Button onClick={() => setListDialogOpen(false)}>close</Button>
          </div>

        </div>
      </Dialog>

      <div>
        <Link to="/">
          <Button>close</Button>
        </Link>

      </div>
      
    </div>
  )
}

export default function HistoryView() {

  const [path, setPath] = useState<Array<AugmentedGPSPoint>>([])

  const getPathColors = (path: Array<AugmentedGPSPoint>): Array<string> => {
    if(path.length === 0) {
      return [];
    }
    const minValue = 0;
    const maxValue = Math.max(...path.map(point => point.speed));
    let delta = 1;

    if(maxValue > minValue) {
      delta = maxValue - minValue;
    }
    const relativeValues = path.map(point => (point.speed-minValue)/delta);
    
    const cMin = 200;
    const cMax = 0;

    return relativeValues.map(val => `rgb(${Math.round(cMin + val*(cMax - cMin)).toFixed(0)},${Math.round(cMin + val*(cMax - cMin)).toFixed(0)},255)`)
  }

  return (
    <div style={{display: "flex", flexDirection: "column", width: "100%", height: "100%"}}>

      <div style={{width: "100%"}}>
        <HistoryViewControls path={path} setPath={(reference) => setPath(historyUseCases.getPath(reference))} />
      </div>

      <div style={{flexGrow: 1, width: "100%"}}>
        <MyMap path={path} pathColors={getPathColors(path)}></MyMap>
      </div>

      <div style={{height: "20%"}}>
        <Chart path={path}/>
      </div>
    </div>
  )

}