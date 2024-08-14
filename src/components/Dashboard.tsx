import { ReactNode } from "react";

import Metric from "./Metric";

import { BaseRally } from "@/domain";


export function Dashboard({rally, map, controls}: {rally: BaseRally, map: ReactNode, controls: ReactNode}) {

  const metrics: Array<ReactNode> = [
    <Metric value={rally.calulatePathDistance().toFixed(1)} title="Traveled distance" unit="km" />,
    <Metric value={rally.calculateRemainingDistance().toFixed(1)} title="Remaining distance" unit="km" />,
    <Metric value={rally.calculatePathAverageVelocity().toFixed(0)} title="Average speed" unit="km/h" />,
    <Metric value={rally.calculateRequiredAverageVelocity().toFixed(0)} title="Required speed" unit="km/h" />,
  ];

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