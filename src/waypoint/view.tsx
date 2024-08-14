import { useState } from "react";

import dayjs from "dayjs";

import { Button, Dialog, TextField, IconButton, Checkbox, InputAdornment } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import AddIcon from '@mui/icons-material/Add';

import MyMap from "@/components/Map";
import Metric from "@/components/Metric";
import { Dashboard } from "@/components/Dashboard";
import useNoSleep from "@/components/NoSleep";

import { Location, Waypoint } from "@/domain";
import { WaypointRally } from "./domain";
import { waypointRallyUseCases } from "./factory";
import { Link } from "react-router-dom";
import { DragIndicator } from "@mui/icons-material";


//create your forceUpdate hook
function useForceUpdate(){
  const [, setValue] = useState(0);
  return () => setValue(value => value + 1); 
}

const getDefaultCheckpointDate = () => new Date(new Date().getTime() + 2*3600*1000);


function WaypointControl({oldWaypoint, updateWaypoint}: {oldWaypoint: Waypoint, updateWaypoint: (waypoint: Waypoint) => void}){

  const [latitude, setLatitude] = useState<String>(oldWaypoint.location.latitude.toFixed(6));
  const [longitude, setLongitude] = useState<String>(oldWaypoint.location.longitude.toFixed(6));
  // const [altitude, setAltitude] = useState<String>(oldWaypoint.location.altitude.toString());
  const [passed, setPassed] = useState<boolean>(oldWaypoint.passed);

  const onLatitudeChange = (value: string) => {
    setLatitude(value);
    const floatValue = parseFloat(value);
    if(isNaN(floatValue)){
      return
    }
    const newWaypoint: Waypoint = {
      reference: oldWaypoint.reference, 
      location: {...oldWaypoint.location, latitude: floatValue}, 
      passed: oldWaypoint.passed,
    };
    updateWaypoint(newWaypoint);
  }

  const onLongitudeChange = (value: string) => {
    setLongitude(value);
    const floatValue = parseFloat(value);
    if(isNaN(floatValue)){
      return
    }
    const newWaypoint: Waypoint = {
      reference: oldWaypoint.reference, 
      location: {...oldWaypoint.location, longitude: floatValue}, 
      passed: oldWaypoint.passed,
    };
    updateWaypoint(newWaypoint);
  }

  const onPassedChange = (value: boolean) => {
    setPassed(value);
    const newWaypoint: Waypoint = {
      reference: oldWaypoint.reference, 
      location: oldWaypoint.location,
      passed: value,
    };
    updateWaypoint(newWaypoint);
  }

  return (
    <div style={{display: "flex", gap: "0.2em", marginTop: "0.7em"}}>
      <IconButton aria-label="drag">
        <DragIndicator />
      </IconButton>
      <TextField label="Latitude" value={latitude} onChange={(e) => onLatitudeChange(e.target.value)} type="tel" size="small" InputProps={{
          endAdornment: <InputAdornment position="end">°</InputAdornment>,
        }}></TextField>
      <TextField label="Longitude" value={longitude} onChange={(e) => onLongitudeChange(e.target.value)} type="tel" size="small" InputProps={{
          endAdornment: <InputAdornment position="end">°</InputAdornment>,
        }}></TextField>
      <Checkbox checked={passed} onChange={() => onPassedChange(!passed)}></Checkbox>
    </div>
  )
}


function WaypointsControl({oldWaypoints, updateWaypoints, addWaypoint}: 
                          {oldWaypoints: Array<Waypoint>, updateWaypoints: (waypoints: Array<Waypoint>) => void, addWaypoint: (location: Location) => void}) {

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
      <div>
        {oldWaypoints.map((waypoint) => (
          <WaypointControl key={waypoint.reference} oldWaypoint={waypoint} updateWaypoint={updateWaypoint}/>        
        ))}
      </div>

      <IconButton aria-label="add" onClick={() => addWaypoint({latitude: 50, longitude: 5, altitude: 0})} >
        <AddIcon />
      </IconButton>

    </div>
  )
}


function WaypointRallyControls({rally, start, pause, clear, updateWaypoints, updateCheckpointDate, addWaypoint}: 
                               {rally: WaypointRally, start: () => void, pause: () => void, clear: (checkpointDate: Date) => void, 
                                updateWaypoints: (waypoints: Array<Waypoint>) => void, updateCheckpointDate: (date: Date) => void, 
                                addWaypoint: (location: Location) => void}){


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

      <Dialog open={waypointsDialogOpen} onClose={() => setWaypointsDialogOpen(false)} fullScreen>
        <div style={{padding: "0.5em", height: "100%", display: "flex", flexDirection: "column" }}>
          <h3 style={{marginTop: 0}}>Waypoints</h3>
          <div style={{flexGrow: 1, overflowY: "scroll"}}>
            <WaypointsControl oldWaypoints={rally.waypoints} updateWaypoints={waypointsChanged} addWaypoint={addWaypoint}/>
          </div>
          <div style={{display: "flex", justifyContent: "flex-end"}}>
            <Button onClick={() => setWaypointsDialogOpen(false)}>close</Button>
          </div>

        </div>
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

  const addWaypoint = (location: Location) => {
    waypointRallyUseCases.addWaypoint(rally, location, false);
    forceUpdate();
  }

  return (
    <Dashboard map={<MyMap path={rally.path.gpsPoints} waypoints={rally.waypoints} updateWaypoints={updateWaypoints}></MyMap>} metrics={[
      <Metric value={rally.calulatePathDistance().toFixed(1)} title="Traveled distance" unit="km" />,
      <Metric value={rally.calculateRemainingDistance().toFixed(1)} title="Remaining distance" unit="km" />,
      <Metric value={rally.calculatePathAverageVelocity().toFixed(0)} title="Average speed" unit="km/h" />,
      <Metric value={rally.calculateRequiredAverageVelocity().toFixed(0)} title="Required speed" unit="km/h" />,
    ]} controls={<WaypointRallyControls rally={rally} start={start} pause={pause} clear={clear} updateWaypoints={updateWaypoints} updateCheckpointDate={updateCheckpointDate} addWaypoint={addWaypoint}/>}/>
  )

}