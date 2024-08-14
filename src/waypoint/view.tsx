import { useState } from "react";

import dayjs from "dayjs";

import { Button, Dialog, TextField } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";

import MyMap from "@/components/Map";
import Metric from "@/components/Metric";
import { Dashboard } from "@/components/Dashboard";
import useNoSleep from "@/components/NoSleep";

import { WaypointRally, Waypoint } from "./domain";
import { waypointRallyUseCases } from "./factory";
import { Link } from "react-router-dom";


//create your forceUpdate hook
function useForceUpdate(){
  const [, setValue] = useState(0);
  return () => setValue(value => value + 1); 
}

const getDefaultCheckpointDate = () => new Date(new Date().getTime() + 2*3600*1000);


function WaypointControl({oldWaypoint, updateWaypoint}: {oldWaypoint: Waypoint, updateWaypoint: (waypoint: Waypoint) => void}){

  const [latitude, setLatitude] = useState<String>(oldWaypoint.location.latitude.toString());
  // const [longitude, setLongitude] = useState<String>(oldWaypoint.location.longitude.toString());
  // const [altitude, setAltitude] = useState<String>(oldWaypoint.location.altitude.toString());
  // const [passed, setPassed] = useState<boolean>(oldWaypoint.passed);

  const onLatitudeChange = (value: string) => {
    setLatitude(value);
    const floatValue = parseFloat(value);
    if(isNaN(floatValue)){
      return
    }
    const newWaypoint: Waypoint = {
      reference: oldWaypoint.reference, 
      location: {...oldWaypoint.location, latitude: floatValue}, 
      passed: oldWaypoint.passed
    };
    updateWaypoint(newWaypoint);
  }

  return (
    <div>
      <TextField label="Latitude" value={latitude} onChange={(e) => onLatitudeChange(e.target.value)}></TextField>
    </div>
  )

}


function WaypointsControl({oldWaypoints, updateWaypoints}: 
                          {oldWaypoints: Array<Waypoint>, updateWaypoints: (waypoints: Array<Waypoint>) => void}) {

  const updateWaypoint = (waypoint: Waypoint): void => {
    const newWaypoints = oldWaypoints.map((oldWaypoint) => {
      if(oldWaypoint.reference === waypoint.reference){
        return waypoint;
      }
      return oldWaypoint;
    });
    updateWaypoints(newWaypoints);
  }

  return (
    <div>
      {oldWaypoints.map((waypoint) => (
        <WaypointControl key={waypoint.reference} oldWaypoint={waypoint} updateWaypoint={updateWaypoint}/>        
      ))}
    </div>
  )
}


function WaypointRallyControls({rally, start, pause, clear, updateWaypoints, updateCheckpointDate}: 
                               {rally: WaypointRally, start: () => void, pause: () => void, clear: (checkpointDate: Date) => void, updateWaypoints: (waypoints: Array<Waypoint>) => void, updateCheckpointDate: (date: Date) => void }){


  const [checkpointDate, setCheckpointDate] = useState<dayjs.Dayjs>(dayjs(getDefaultCheckpointDate()));
  const [waypointsDialogOpen, setWaypointsDialogOpen] = useState<boolean>(false);

  const waypointsChanged = (waypoints: Array<Waypoint>) => {
    updateWaypoints(waypoints);
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
        <Button onClick={() => setWaypointsDialogOpen(true)}>waypoints</Button>
      </div>

      <Dialog open={waypointsDialogOpen} onClose={() => setWaypointsDialogOpen(false)}>
        <WaypointsControl oldWaypoints={rally.waypoints} updateWaypoints={waypointsChanged} />
      </Dialog>

      <div>
        {rally.updating && (
          <Button onClick={() => pause()}>pause</Button>
        )}

        {!rally.updating && (
          <Button onClick={() => start()}>start</Button>
        )}
        <Button onClick={() => clear(checkpointDate.toDate())}>clear</Button>

        <Link to="/">
          <Button>close</Button>
        </Link>

      </div>
      
    </div>
  );
}


export default function WaypointRallyView(){

  useNoSleep();
  const forceUpdate = useForceUpdate();

  const [rally, setRally] = useState<WaypointRally>(waypointRallyUseCases.createNew(getDefaultCheckpointDate()));


  const start = () => {
    waypointRallyUseCases.startUpdatingRally(rally, (_) => {forceUpdate()});
    forceUpdate();
  }

  const pause = () => {
    waypointRallyUseCases.stopUpdatingRally(rally);
    forceUpdate();
  }

  const clear = (checkpointDate: Date) => {
    const newRally = waypointRallyUseCases.createNew(checkpointDate);
    setRally(newRally);
  }

  const updateWaypoints = (waypoints: Array<Waypoint>) => {
    waypointRallyUseCases.updateWaypoints(rally, waypoints);
    forceUpdate();
  }

  const updateCheckpointDate = (checkpointDate: Date) => {
    waypointRallyUseCases.updateCheckpointDate(rally, checkpointDate);
    forceUpdate();
  }

  return (
    <Dashboard map={<MyMap path={rally.path.gpsPoints}></MyMap>} metrics={[
      <Metric value={rally.calulatePathDistance().toFixed(1)} title="Traveled distance" unit="km" />,
      <Metric value={rally.calculateRemainingDistance().toFixed(1)} title="Remaining distance" unit="km" />,
      <Metric value={rally.calculatePathAverageVelocity().toFixed(0)} title="Average speed" unit="km/h" />,
      <Metric value={rally.calculateRequiredAverageVelocity().toFixed(0)} title="Required speed" unit="km/h" />,
    ]} controls={<WaypointRallyControls rally={rally} start={start} pause={pause} clear={clear} updateWaypoints={updateWaypoints} updateCheckpointDate={updateCheckpointDate}/>}/>
  )

}