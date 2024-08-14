import { useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMapEvents} from "react-leaflet"
import { ScaleControl } from 'react-leaflet/ScaleControl'
import { Map, LatLng, Marker as LeafletMarker } from "leaflet";

import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"

import MyLocationIcon from '@mui/icons-material/MyLocation';
import { Waypoint, GPSPoint } from '@/domain';
import { locationUsecases } from '@/useCases';


function WaypointMarker({waypoint, updateWaypoint, index}: {waypoint: Waypoint, updateWaypoint: (waypoint: Waypoint) => void, index: number}) {

  const markerRef = useRef<LeafletMarker>(null)

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          const latlng = marker.getLatLng()
          const newWaypoint = {
            ...waypoint,
            location: {
              latitude: latlng.lat,
              longitude: latlng.lng,
              altitude: latlng.alt === undefined ? waypoint.location.altitude : latlng.alt
            },
          } 
          updateWaypoint(newWaypoint)
        }
      },
    }),
    [updateWaypoint],
  )

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={new LatLng(waypoint.location.latitude, waypoint.location.longitude, waypoint.location.altitude)}
      ref={markerRef}>
      <Popup minWidth={90}>
        <span>Waypoint {index + 1}{waypoint.passed ? ", passed" : ""}</span>
      </Popup>
    </Marker>
  )
}

function DragDetection({stopFollowing}: {stopFollowing: () => void}) {
  useMapEvents({
    dragend: () => {
      stopFollowing()
    }
  });
  return null;
}


export default function MyMap({path, waypoints, updateWaypoints}: {path: Array<GPSPoint>, waypoints?: Array<Waypoint>, updateWaypoints?: (waypoints: Array<Waypoint>) => void}) {
  const [map, setMap] = useState<Map | null>(null);
  const [followMe, setFollowMe] = useState<boolean>(true);


  const updateWaypoint = (waypoint: Waypoint): void => {
    if(waypoints === undefined || updateWaypoints === undefined) {
      return;
    }

    const newWaypoints = waypoints.map((oldWaypoint) => {
      if(oldWaypoint.reference === waypoint.reference){
        return waypoint;
      }
      return oldWaypoint;
    });
    updateWaypoints(newWaypoints);
  }

  const getLatestPosition = (): LatLng => {
    const location = locationUsecases.getLastKnownLocation()
    return new LatLng(location.latitude, location.longitude);

    // if(path.length === 0){
    //   return new LatLng(50, 5);
    // }
    // const loc = path[path.length-1].location;
    // return new LatLng(loc.latitude, loc.longitude);
  }

  const flyToMyPosition = () => {
    if(map !== null){
      map.flyTo(getLatestPosition());
    }
  }
  
  if( followMe ){
    flyToMyPosition();
  }


  return (
    <div style={{width: "100%", height: "100%"}}>
      <MapContainer center={getLatestPosition()} zoom={13} scrollWheelZoom={false} style={{height: "100%"}} ref={setMap}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ScaleControl></ScaleControl>

        <div className="leaflet-top leaflet-right">
          <div className="leaflet-control leaflet-bar">
            <button onClick={() => {setFollowMe(true); flyToMyPosition();}} style={{padding: "0.25rem", display: "inline-flex", border: "none", cursor: "pointer"}}>
              <MyLocationIcon />
            </button>
          </div>
        </div>

        <Polyline pathOptions={{color: 'blue'}} positions={path.map((gpsPoint) => ([gpsPoint.location.latitude, gpsPoint.location.longitude]))} />

        {waypoints !== undefined && waypoints.map((waypoint, index) => (
          <WaypointMarker key={waypoint.reference} waypoint={waypoint} updateWaypoint={updateWaypoint} index={index}/>
        ))}

        {waypoints !== undefined && (
          <Polyline pathOptions={{color: 'gray', dashArray: '5, 10'}} positions={[getLatestPosition(), ...waypoints.filter((waypoint) => !waypoint.passed).map((waypoint) => new LatLng(waypoint.location.latitude, waypoint.location.longitude))]} />
        )}

        <DragDetection stopFollowing={() => setFollowMe(false)}/>
      </MapContainer>
    </div>
  )
}