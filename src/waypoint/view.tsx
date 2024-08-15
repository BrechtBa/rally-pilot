import { useState } from "react";

import dayjs from "dayjs";

import { Button, Dialog, TextField, IconButton, Checkbox, InputAdornment } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import AddIcon from '@mui/icons-material/Add';

import MyMap from "@/components/Map";
import { Dashboard } from "@/components/Dashboard";
import useNoSleep from "@/components/NoSleep";

import { Waypoint } from "@/domain";
import { WaypointRally } from "./domain";
import { waypointRallyUseCases } from "./factory";
import { Link } from "react-router-dom";
import { Delete, DragIndicator } from "@mui/icons-material";
import { locationUsecases } from "@/useCases";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Item from "@/components/Item";


//create your forceUpdate hook
function useForceUpdate(){
  const [, setValue] = useState(false);
  return () => setValue(value => !value); 
}

const getDefaultCheckpointDate = () => new Date(new Date().getTime() + 2*3600*1000);


function WaypointControl({oldWaypoint, updateWaypoint, deleteWaypoint}: 
                         {oldWaypoint: Waypoint, updateWaypoint: (waypoint: Waypoint) => void, deleteWaypoint: (reference: string) => void}){

  const [latitude, setLatitude] = useState<String>(oldWaypoint.location.latitude.toFixed(6));
  const [longitude, setLongitude] = useState<String>(oldWaypoint.location.longitude.toFixed(6));
  // const [altitude, setAltitude] = useState<String>(oldWaypoint.location.altitude.toString());
  const [passed, setPassed] = useState<boolean>(oldWaypoint.passed);

  const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: oldWaypoint.reference})
  
  const onLatitudeChange = (value: string) => {
    setLatitude(value.replace(",", "."));
    const floatValue = parseFloat(value.replace(",", "."));
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
    setLongitude(value.replace(",", "."));
    const floatValue = parseFloat(value.replace(",", "."));
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
    <div style={{touchAction: "none", display: "flex", gap: "0.2em", marginTop: "0.7em", transform: CSS.Transform.toString(transform), transition: transition}} ref={setNodeRef}>
      <IconButton aria-label="drag" {...attributes} {...listeners}>
        <DragIndicator />
      </IconButton>
      <TextField label="Latitude" value={latitude} onChange={(e) => onLatitudeChange(e.target.value)} type="tel" size="small" InputProps={{
          endAdornment: <InputAdornment position="end">°</InputAdornment>,
        }}></TextField>
      <TextField label="Longitude" value={longitude} onChange={(e) => onLongitudeChange(e.target.value)} type="tel" size="small" InputProps={{
          endAdornment: <InputAdornment position="end">°</InputAdornment>,
        }}></TextField>
      <Checkbox checked={passed} onChange={() => onPassedChange(!passed)}></Checkbox>
      <IconButton aria-label="delete" onClick={() => deleteWaypoint(oldWaypoint.reference)}>
        <Delete />
      </IconButton>
    </div>
  )
}


function WaypointsControl({oldWaypoints, updateWaypoints, addWaypoint, deleteWaypoint}: 
                          {oldWaypoints: Array<Waypoint>, 
                           updateWaypoints: (waypoints: Array<Waypoint>) => void, 
                           addWaypoint: () => void, 
                           deleteWaypoint: (reference: string) => void}) {

  const updateWaypoint = (waypoint: Waypoint): void => {
    const newWaypoints = oldWaypoints.map((oldWaypoint) => {
      if(oldWaypoint.reference === waypoint.reference){
        return waypoint;
      }
      return oldWaypoint;
    });
    updateWaypoints(newWaypoints);
  }

  const sortableWaypoints = oldWaypoints.map((wp) => ({id: wp.reference, ...wp}));
  const sortableWaypointIds = sortableWaypoints.map((wp) => wp.id);

  const reorderWaypointsList = (e: DragEndEvent) => {
    if(!e.over) {
      return;
    }
    if(e.active.id !== e.over.id) {
      const oldIndex = sortableWaypointIds.indexOf(e.active.id.toString());
      const newIndex = sortableWaypointIds.indexOf(e.over!.id.toString());
      const reorderedSortableWaypoints = arrayMove(sortableWaypoints, oldIndex, newIndex);
      updateWaypoints(reorderedSortableWaypoints.map((wp) => ({reference: wp.reference, location: wp.location, passed: wp.passed})));
    }
  }


  return (
    <div>
      <DndContext onDragEnd={reorderWaypointsList}>
        <SortableContext items={sortableWaypoints}>
          <div>
            {sortableWaypoints.map((waypoint) => (
              <WaypointControl key={waypoint.reference} oldWaypoint={waypoint} updateWaypoint={updateWaypoint} deleteWaypoint={deleteWaypoint}/>        
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <IconButton aria-label="add" onClick={() => addWaypoint()} >
        <AddIcon />
      </IconButton>

    </div>
  )
}


function WaypointRallyControls({rally, start, pause, clear, updateWaypoints, updateCheckpointDate, addWaypoint, deleteWaypoint, forceUpdate}: 
                               {rally: WaypointRally, start: () => void, pause: () => void, clear: (checkpointDate: Date) => void, 
                                updateWaypoints: (waypoints: Array<Waypoint>) => void, updateCheckpointDate: (date: Date) => void, 
                                addWaypoint: () => void, deleteWaypoint: (reference: string) => void, forceUpdate: () => void}){


  const [checkpointDate, setCheckpointDate] = useState<dayjs.Dayjs>(dayjs(getDefaultCheckpointDate()));
  const [waypointsDialogOpen, setWaypointsDialogOpen] = useState<boolean>(false);
  
  const [storeWaypointsDialogOpen, setStoreWaypointsDialogOpen] = useState<boolean>(false);
  const [storeWaypointsReference, setStoreWaypointsReference] = useState<string>("");
 
  const [loadWaypointsDialogOpen, setLoadWaypointsDialogOpen] = useState<boolean>(false);


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
          <div style={{flexGrow: 1, overflowY: "scroll", overflowX: "hidden"}}>
            <WaypointsControl oldWaypoints={rally.waypoints} updateWaypoints={waypointsChanged} addWaypoint={addWaypoint} deleteWaypoint={deleteWaypoint}/>
          </div>

          <div style={{display: "flex", justifyContent: "flex-end"}}>
            <Button onClick={() => setStoreWaypointsDialogOpen(true)}>save</Button>
            <Button onClick={() => setLoadWaypointsDialogOpen(true)}>load</Button>
            <Button onClick={() => setWaypointsDialogOpen(false)}>close</Button>
          </div>

        </div>
      </Dialog>

      <Dialog open={storeWaypointsDialogOpen} onClose={() => setStoreWaypointsDialogOpen(false)}>
        <div style={{padding: "0.5em", height: "100%", display: "flex", flexDirection: "column" }}>
          <h3 style={{marginTop: 0}}>Store Waypoints</h3>
          
          <div style={{flexGrow: 1}}>
            <TextField label="name" value={storeWaypointsReference} onChange={(e) => setStoreWaypointsReference(e.target.value)}/>
          </div>
          
          <div style={{display: "flex", justifyContent: "flex-end"}}>
            <Button onClick={() => {waypointRallyUseCases.storeWaypoints(rally, storeWaypointsReference); setStoreWaypointsReference(""); setStoreWaypointsDialogOpen(false);}}>save</Button>
            <Button onClick={() => {setStoreWaypointsReference(""); setStoreWaypointsDialogOpen(false)}}>close</Button>
          </div>

        </div>
      </Dialog>

      <Dialog open={loadWaypointsDialogOpen} onClose={() => setLoadWaypointsDialogOpen(false)} fullScreen>
        <div style={{padding: "0.5em", height: "100%", display: "flex", flexDirection: "column" }}>
          <h3 style={{marginTop: 0}}>Load waypoints</h3>
          
          <div style={{flexGrow: 1}}>
            {waypointRallyUseCases.listStoredWaypoints().map((reference) => (
              <Item key={reference} onClick={() => {waypointRallyUseCases.loadWaypoints(rally, reference); setLoadWaypointsDialogOpen(false); setWaypointsDialogOpen(false); forceUpdate();}}>
                {reference}
              </Item>
            ))}
          </div>
          
          <div style={{display: "flex", justifyContent: "flex-end"}}>
            <Button onClick={() => setLoadWaypointsDialogOpen(false)}>close</Button>
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

  const addWaypoint = () => {
    waypointRallyUseCases.addWaypoint(rally, locationUsecases.getLastKnownLocation(), false);
    forceUpdate();
  }

  const deleteWaypoint = (reference: string) => {
    waypointRallyUseCases.updateWaypoints(rally, rally.waypoints.filter((wp: Waypoint) => wp.reference != reference));
    forceUpdate();
  }

  return (
    <Dashboard 
      rally={rally}  
      map={<MyMap path={rally.path.gpsPoints} waypoints={rally.waypoints} updateWaypoints={updateWaypoints}></MyMap>} 
      controls={<WaypointRallyControls rally={rally} start={start} pause={pause} clear={clear} updateCheckpointDate={updateCheckpointDate} updateWaypoints={updateWaypoints} addWaypoint={addWaypoint} deleteWaypoint={deleteWaypoint} forceUpdate={forceUpdate}/>}/>
  )

}