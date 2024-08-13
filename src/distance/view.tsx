import { useState } from "react";

import dayjs from "dayjs";

import { Button, TextField } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";

import MyMap from "@/components/Map";
import Metric from "@/components/Metric";
import { Dashboard } from "@/components/Dashboard";
import useNoSleep from "@/components/NoSleep";

import { DistanceRally } from "./domain";
import { distanceRallyUseCases } from "./factory";


//create your forceUpdate hook
function useForceUpdate(){
  const [, setValue] = useState(0);
  return () => setValue(value => value + 1); 
}


const defaultTotalDistance = 100;
const defaultCheckpointDate = new Date(new Date().getTime() + 2*3600*1000);


function DistanceRallyControls({rally, start, pause, clear, updateTotalDistance, updateCheckpointDate}: 
                               {rally: DistanceRally, start: () => void, pause: () => void, clear: (totalDistance: number, checkpointDate: Date) => void, updateTotalDistance: (distance: number) => void, updateCheckpointDate: (date: Date) => void }){

  const [totalDistance, setTotalDistance] = useState<number>(defaultTotalDistance);
  const [checkpointDate, setCheckpointDate] = useState<dayjs.Dayjs>(dayjs(defaultCheckpointDate));

  const totalDistanceChanged = (value: number) => {
    if(isNaN(value)){
      return
    }
    setTotalDistance(value);
    updateTotalDistance(value);
  }

  const checkpointDateChanged = (value: dayjs.Dayjs) => {
    setCheckpointDate(value);
    updateCheckpointDate(value.toDate());
  }

  return (
    <div style={{display: "flex", gap: "0.5em", marginTop: "1em", marginBottom: "0.5em", width: "100%", justifyContent: "center", flexWrap: "wrap"}}>
      <div style={{maxWidth: "8em"}}>
        <TextField label="Total Distance" value={totalDistance} onChange={(e) => totalDistanceChanged(parseInt(e.target.value))}></TextField>
      </div>
      <div style={{maxWidth: "12em"}}>
        <DateTimePicker label="Checkpoint time" value={checkpointDate} onChange={(newValue) => newValue!== null && checkpointDateChanged(newValue)} ampm={false}/>
      </div>

      <div>
        {rally.updating && (
          <Button onClick={() => pause()}>pause</Button>
        )}

        {!rally.updating && (
          <Button onClick={() => start()}>start</Button>
        )}
        <Button onClick={() => clear(totalDistance, checkpointDate.toDate())}>clear</Button>

      </div>
      
    </div>
  );
}


export default function DistanceRallyView(){

  useNoSleep();
  const forceUpdate = useForceUpdate();

  const [rally, setRally] = useState<DistanceRally>(distanceRallyUseCases.createNew(defaultTotalDistance, defaultCheckpointDate));


  const start = () => {
    distanceRallyUseCases.startUpdatingRally(rally, (_) => {forceUpdate()});
    forceUpdate();
  }

  const pause = () => {
    distanceRallyUseCases.stopUpdatingRally(rally);
    forceUpdate();
  }

  const clear = (totalDistance: number, checkpointDate: Date) => {
    const newRally = distanceRallyUseCases.createNew(totalDistance, checkpointDate);
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
    <Dashboard map={<MyMap path={rally.path.gpsPoints}></MyMap>} metrics={[
      <Metric value={rally.calculateRemainingDistance().toFixed(1)} title="Remaining distance" unit="km" />,
      <Metric value={rally.calculateRequiredAverageVelocity().toFixed(0)} title="Required speed" unit="km/h" />,
      <Metric value={rally.calulatePathDistance().toFixed(1)} title="Traveled distance" unit="km" />,
      <Metric value={rally.calculatePathAverageVelocity().toFixed(0)} title="Average speed" unit="km/h" />,
    ]} controls={<DistanceRallyControls rally={rally} start={start} pause={pause} clear={clear} updateTotalDistance={updateTotalDistance}  updateCheckpointDate={updateCheckpointDate}/>}/>
  )

}