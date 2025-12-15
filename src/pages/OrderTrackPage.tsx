import { useParams } from "react-router-dom";
import { Box, Grid } from "@mui/material";
import LayoutMain from "../components/layout/layoutMain";

// Import custom components
import OrderTimeline from "../components/OrderTimeLine/OrderTimeline";
import OrderTrackingMap from "../components/OrderTrackingMap/OrderTrackingMap";

const OrderTrackPage = () => {
  const { id } = useParams();
  const OrderId = id || "N/A";

  return (
    <LayoutMain>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "80vh",
          bgcolor: "#f5f5f5",
          overflow: "hidden", // Prevents full page scroll, scrolls inside components if needed
        }}
      >
        {/* --- CONTENT AREA --- */}
        <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
          <Grid container spacing={3} sx={{ height: "100%" }}>
            {/* LEFT: Timeline */}
            <Grid size={{ xs: 12, md: 5 }} sx={{ height: "100%" }}>
              <OrderTimeline orderId={OrderId} />
            </Grid>

            {/* RIGHT: Map */}
            <Grid size={{ xs: 12, md: 7 }} sx={{ height: "100%" }}>
              <OrderTrackingMap trackingId={id} />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </LayoutMain>
  );
};

export default OrderTrackPage;
