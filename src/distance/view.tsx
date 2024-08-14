import { useState } from "react";

import dayjs from "dayjs";

import { Button, TextField } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";

import MyMap from "@/components/Map";
import { Dashboard } from "@/components/Dashboard";
import useNoSleep from "@/components/NoSleep";

import { DistanceRally } from "./domain";
import { distanceRallyUseCases } from "./factory";
import { Link } from "react-router-dom";


//create your forceUpdate hook
function useForceUpdate(){
  const [, setValue] = useState(0);
  return () => setValue(value => value + 1); 
}


const getDefaultTotalDistance = () => 100;
const getDefaultCheckpointDate = () => new Date(new Date().getTime() + 2*3600*1000);


function DistanceRallyControls({rally, start, pause, clear, updateTotalDistance, updateCheckpointDate}: 
                               {rally: DistanceRally, start: () => void, pause: () => void, clear: (checkpointDate: Date, totalDistance: number) => void, updateTotalDistance: (distance: number) => void, updateCheckpointDate: (date: Date) => void }){

  const [totalDistance, setTotalDistance] = useState<string>(getDefaultTotalDistance().toString());
  const [checkpointDate, setCheckpointDate] = useState<dayjs.Dayjs>(dayjs(getDefaultCheckpointDate()));

  const totalDistanceChanged = (value: string) => {
    setTotalDistance(value);
    const intValue = parseInt(value);
    if(isNaN(intValue)){
      return
    }
    updateTotalDistance(intValue);
  }

  const checkpointDateChanged = (value: dayjs.Dayjs) => {
    setCheckpointDate(value);
    updateCheckpointDate(value.toDate());
  }

  return (
    <div style={{display: "flex", gap: "0.5em", marginTop: "1em", marginBottom: "0.5em", width: "100%", justifyContent: "center", flexWrap: "wrap"}}>
      <div style={{maxWidth: "12em"}}>
        <DateTimePicker label="Checkpoint time" value={checkpointDate} onChange={(newValue) => newValue!== null && checkpointDateChanged(newValue)} ampm={false}/>
      </div>
      <div style={{maxWidth: "8em"}}>
        <TextField label="Total Distance" value={totalDistance} onChange={(e) => totalDistanceChanged(e.target.value)} type="tel"></TextField>
      </div>

      <div>
        {rally.updating && (
          <Button onClick={() => pause()}>pause</Button>
        )}

        {!rally.updating && (
          <Button onClick={() => start()}>start</Button>
        )}
        <Button onClick={() => clear(checkpointDate.toDate(), parseInt(totalDistance))}>clear</Button>
        
        <Link to="/">
          <Button>close</Button>
        </Link>

      </div>
      
    </div>
  );
}


export default function DistanceRallyView(){

  useNoSleep();
  const forceUpdate = useForceUpdate();

  const [rally, setRally] = useState<DistanceRally>(distanceRallyUseCases.createNew(getDefaultCheckpointDate(), getDefaultTotalDistance()));


  const start = () => {
    distanceRallyUseCases.startUpdatingRally(rally, (_) => {forceUpdate()});
    forceUpdate();
  }

  const pause = () => {
    distanceRallyUseCases.stopUpdatingRally(rally);
    forceUpdate();
  }

  const clear = (checkpointDate: Date, totalDistance: number) => {
    const newRally = distanceRallyUseCases.createNew(checkpointDate, totalDistance);
    setRally(newRally);
  }

  const updateTotalDistance = (totalDistance: number) => {
    distanceRallyUseCases.updateTotalDistance(rally, totalDistance);
    forceUpdate();
  }

  const updateCheckpointDate = (checkpointDate: Date) => {
    distanceRallyUseCases.updateCheckpointDate(rally, checkpointDate);
    forceUpdate();
  }

  return (
    <Dashboard 
      rally={rally} 
      map={<MyMap path={rally.path.gpsPoints}></MyMap>} 
      controls={<DistanceRallyControls rally={rally} start={start} pause={pause} clear={clear} updateCheckpointDate={updateCheckpointDate} updateTotalDistance={updateTotalDistance}/>}/>
  )

}