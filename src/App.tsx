import './App.css'

import { Routes, Route, Outlet, Link } from "react-router-dom";

import { Paper } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import DistanceRallyView from './distance/view';
import WaypointRallyView from './waypoint/view';
import HistoryView from './history/view';


function Layout() {
  return (
    <div style={{width: "100%", height: "100%"}}>
      <Outlet />
    </div>
  );
}

function NavigationCard({title, description}: {title: string, description: string}) {
  return (
    <Paper style={{padding: "1em", backgroundColor: "rgb(101, 139, 176)", color: "#ffffff"}}>
        <h1>{title}</h1>
        <p>{description}</p>
    </Paper>
  )
}

function Home() {

  return (
    <div style={{display: "flex", flexDirection: "column", gap: "1em", margin: "1em"}}>
      <Link to="/distance">
        <NavigationCard title="Distance rally" description="Set a fixed distance and compare it to the total traveled distance."/>
      </Link>
      
      <Link to="/waypoint">
        <NavigationCard title="Waypoint rally" description="Determine the distance to go based on a set of waypoints."/>
      </Link>

      <Link to="/history">
        <NavigationCard title="History" description="Show historical trips."/>
      </Link>
    </div>
  )
}



function App() {

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>

        <Routes>
          <Route path="/" element={<Layout />} >
            <Route index element={<Home />} />
            <Route path="distance" element={<DistanceRallyView />} />
            <Route path="waypoint" element={<WaypointRallyView />} />
            <Route path="history" element={<HistoryView />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>

      </LocalizationProvider>

    </>
  )
}

export default App
