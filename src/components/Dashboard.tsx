import { ReactNode } from "react";


export function Dashboard({map, metrics, controls}: {map: ReactNode, metrics: Array<ReactNode>, controls: ReactNode}) {

  return (
    <div style={{display: "flex", flexDirection: "column", width: "100%", height: "100%"}}>

      <div style={{width: "100%"}}>
        {controls}
      </div>

      <div style={{flexGrow: 1, width: "100%"}}>
        {map}
      </div>

      <div style={{display: "flex", flexDirection: "row", justifyContent: "flex-start", width: "100%", flexWrap: "wrap"}}>
        {metrics.map((metric, index) =>(
          <div key={index} style={{display: "flex", justifyContent: "center", width: "50%", marginBottom: "0.5em", marginTop: "0.5em"}}>
            {metric}
          </div>
        ))}
      </div>

    </div>
  );

}