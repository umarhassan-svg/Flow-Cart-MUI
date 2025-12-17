import { Box, Grid } from "@mui/material";
import { useParams } from "react-router-dom";
import { OrderTrackingMap } from "../components/order/OrderTrackingMap/OrderTrackingMap";
import LayoutMain from "../components/layout/layoutMain";
import OrderTimeline from "../components/order/OrderTimeLine/OrderTimeline";
// -------------------------
// OrderTrackPage (responsive grid + usage of OrderTrackingMap)
// -------------------------

export const OrderTrackPage: React.FC = () => {
  const { id } = useParams();

  return (
    <LayoutMain>
      <Box
        sx={{
          height: { xs: "auto", md: "84vh" },
          bgcolor: "background.default",
        }}
      >
        {/* Responsive Grid */}
        <Box sx={{ flexGrow: 1, overflow: "hidden", height: "100%" }}>
          <Grid container spacing={3} sx={{ height: "100%" }}>
            {/* LEFT: Timeline */}
            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{ height: { xs: "auto", md: "100%" } }}
            >
              {/* OrderTimeline should be implemented elsewhere; keep height responsive */}
              <Box sx={{ height: "100%" }}>
                {/* <OrderTimeline orderId={OrderId} /> */}
                <OrderTimeline orderId={id} />
              </Box>
            </Grid>

            {/* RIGHT: Map */}
            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{ height: { xs: "auto", md: "100%" } }}
            >
              <OrderTrackingMap trackingId={id ?? undefined} />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </LayoutMain>
  );
};

export default OrderTrackPage;
