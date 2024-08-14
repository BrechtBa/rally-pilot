import MyMap from "@/components/Map";
import { Path } from "@/domain";
import { Button, Dialog } from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";
import { historyUseCases } from "./factory";



function HistoryViewControls({setPath}: {setPath: (reference: string) => void}) {

  const [listDialogOpen, setListDialogOpen] = useState<boolean>(false);

  return (
    <div style={{display: "flex", gap: "0.5em", marginTop: "1em", marginBottom: "0.5em", width: "100%", justifyContent: "center", flexWrap: "wrap"}}>

      <div style={{maxWidth: "8em"}}>
        <Button onClick={() => setListDialogOpen(true)}>list</Button>
      </div>

      <Dialog open={listDialogOpen} onClose={() => setListDialogOpen(false)} fullScreen>
        <div style={{padding: "0.5em", height: "100%", display: "flex", flexDirection: "column" }}>
          <h3 style={{marginTop: 0}}>History</h3>
          <div style={{flexGrow: 1, overflowY: "scroll"}}>
            {historyUseCases.listPaths().map(item => (
              <div key={item.reference} onClick={() => {setPath(item.reference); setListDialogOpen(false);}}>
                {item.date.toISOString()}
              </div>
            ))} 
          </div>
          <div style={{display: "flex", justifyContent: "flex-end"}}>
            <Button onClick={() => setListDialogOpen(false)}>close</Button>
          </div>

        </div>
      </Dialog>

      <div>
        <Link to="/">
          <Button>close</Button>
        </Link>

      </div>
      
    </div>
  )
}

export default function HistoryView() {

  const [path, setPath] = useState<Path>(new Path([]))

  return (
    <div style={{display: "flex", flexDirection: "column", width: "100%", height: "100%"}}>

    <div style={{width: "100%"}}>
      <HistoryViewControls setPath={(reference) => setPath(historyUseCases.getPath(reference))}/>
    </div>

    <div style={{flexGrow: 1, width: "100%"}}>
      <MyMap path={path.gpsPoints}></MyMap>
    </div>
  </div>
  )

}