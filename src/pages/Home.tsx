import LayoutMain from "../components/layout/layoutMain";
import { Typography } from "@mui/material";
const ManagerDashboard = () => {
  console.log("ManagerDashboard");
  return (
    <>
      <LayoutMain>
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{
            fontSize: {
              xs: "1.25rem",
              sm: "1.5rem",
              md: "1.75rem",
              lg: "2rem",
            },
          }}
        >
          Home
        </Typography>
      </LayoutMain>
    </>
  );
};

export default ManagerDashboard;
