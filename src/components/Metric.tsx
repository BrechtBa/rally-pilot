export default function Metric({value, title, unit}: {value: string, title: string, unit?: string}) {

  return (
    <div style={{display: "flex", justifyContent: "center", flexDirection: "column"}}>
      <div style={{fontSize: "2em", lineHeight: "1em"}}>{value} {unit === undefined ? "" : unit} </div>
      <div style={{fontSize: "0.8em"}}>{title}</div>
    </div>
  );
}