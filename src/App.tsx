import './App.css'

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import DistanceRallyView from './distance/view';

function App() {

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>

        <DistanceRallyView />

      </LocalizationProvider>

    </>
  )
}

export default App
