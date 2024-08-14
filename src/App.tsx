import { useState } from 'react';

import './App.css'

import { Routes, Route, Outlet, Link } from "react-router-dom";

import { Paper } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import DistanceRallyView from './distance/view';
import WaypointRallyView from './waypoint/view';


function Layout() {
  return (
    <div style={{width: "100%", height: "100%"}}>
      <Outlet />
    </div>
  );
}


function Home() {

  return (
    <div style={{display: "flex", flexDirection: "column", gap: "1em", margin: "1em"}}>
      <Link to="/distance">
        <Paper>
          <h1>Distance rally</h1>
          <p>test</p>
        </Paper>
      </Link>
      
      <Link to="/waypoint">
        <Paper>
          <h1>Waypoint rally</h1>
          <p>test</p>
        </Paper>
      </Link>
    </div>
  )
}



function App() {

  const [page, setPage] = useState<string>("home")

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>

        <Routes>
          <Route path="/" element={<Layout />} >
            <Route index element={<Home />} />
            <Route path="distance" element={<DistanceRallyView />} />
            <Route path="waypoint" element={<WaypointRallyView />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>

      </LocalizationProvider>

    </>
  )
}

export default App
