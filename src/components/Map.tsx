import { useState } from 'react';
import { MapContainer, TileLayer, Polyline} from "react-leaflet"
import { ScaleControl } from 'react-leaflet/ScaleControl'
import { Map, LatLng } from "leaflet";

import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"

import MyLocationIcon from '@mui/icons-material/MyLocation';
import { GPSPoint } from '@/domain';


export default function MyMap({path}: {path: Array<GPSPoint>}) {
  const [map, setMap] = useState<Map | null>(null);

  const getLatestPosition = (): LatLng => {
    if(path.length === 0){
      return new LatLng(50, 5);
    }
    const loc = path[path.length-1].location;
    return new LatLng(loc.latitude, loc.longitude);
  }

  const flyToMyPosition = () => {
    if(map !== null){
      map.flyTo(getLatestPosition());
    }
  }
  
  flyToMyPosition();

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
            <button onClick={() => flyToMyPosition()} style={{padding: "0.25rem", display: "inline-flex", border: "none", cursor: "pointer"}}>
              <MyLocationIcon />
            </button>
          </div>
        </div>

        {/* <Circle center={myPosition} radius={10}>
          <Popup>
            My position
          </Popup>
        </Circle> */}

        <Polyline pathOptions={{color: 'blue'}} positions={path.map((gpsPoint) => ([gpsPoint.location.latitude, gpsPoint.location.longitude]))} />

        {/* {path.map((marker, key) => (
          <Marker key={key} position={[marker.location.latitude, marker.location.longitude]}>
          </Marker>
        ))}  */}

      </MapContainer>
    </div>
  )
}