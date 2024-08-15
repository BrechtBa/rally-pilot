import { Paper } from "@mui/material";


export default function Item({children, onClick}: {children: string | JSX.Element | JSX.Element[], onClick: () => void}){
  return (
    <Paper style={{cursor: "pointer", padding: "0.2em", marginBottom: "0.2em"}} onClick={() => onClick()}>
      {children}
    </Paper>
  );
}