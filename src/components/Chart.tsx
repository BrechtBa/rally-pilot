import dayjs from 'dayjs';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis} from 'recharts';

import { AugmentedGPSPoint } from '@/history/useCases';

export default function Chart({path}: {path: Array<AugmentedGPSPoint>}) {

  const data = path.map(point => ({
    x: point.date.getTime(),
    y: point.speed,
  }))  

  const formatXAxis = (val: number) => {
    return dayjs(val).format('HH:mm:ss') 
  }

  const formatToolTip = (val: number, name: string) => {
    if(name === "Time") {
      return formatXAxis(val);
    }
    if(name === "Speed") {
      return val.toFixed(1);
    }
    return val;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{top: 10, right: 10, bottom: 10, left: 20}}>
          <CartesianGrid />
          <XAxis type="number" dataKey="x" name="Time" domain={['dataMin', 'dataMax']} tickFormatter={formatXAxis}/>
          <YAxis type="number" dataKey="y" name="Speed" unit="km/h" />
          <ZAxis range={[10, 11]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={formatToolTip} labelFormatter={_ => ""}/>

          <Scatter data={data} fill="rgb(0, 0, 255)" line />
        </ScatterChart>
      </ResponsiveContainer>
  )
}