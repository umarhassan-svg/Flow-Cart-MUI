import { Typography } from "@mui/material";
import LayoutMain from "../components/layout/layoutMain";

const Unauthorized = () => {
  return (
    <>
      <LayoutMain>
        <Typography
          variant="h1"
          align="center"
          sx={{ mt: 10, mb: 10, fontSize: "2.5rem", fontWeight: "bold" }}
        >
          Unauthorized
        </Typography>
      </LayoutMain>
    </>
  );
};

export default Unauthorized;
