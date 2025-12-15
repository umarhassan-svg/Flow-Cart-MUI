import React from "react";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineDot,
  TimelineContent,
  TimelineOppositeContent,
} from "@mui/lab";
import { Typography, Paper, Box, Divider, Chip, Stack } from "@mui/material";

// Icons appropriate for E-commerce
import InventoryIcon from "@mui/icons-material/Inventory"; // Packed
import LocalShippingIcon from "@mui/icons-material/LocalShipping"; // Shipped
import HomeIcon from "@mui/icons-material/Home"; // Delivered
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"; // Placed

// 1. Define Props Interface
interface OrderTimelineProps {
  orderId?: string;
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({ orderId }) => {
  return (
    <Paper elevation={3} sx={{ p: 3, height: "100%", overflowY: "auto" }}>
      {/* 2. Added Order Details Header */}
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Stack spacing={1} direction="row">
            <Typography
              variant="h4"
              color="text.secondary"
              sx={{ fontWeight: "bold" }}
            >
              Order ID:
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              #{orderId || "Pending"}
            </Typography>
          </Stack>
          <Chip
            label="In Transit"
            color="warning"
            size="small"
            variant="outlined"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Estimated Delivery: <strong>Oct 27, 2025</strong>
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", mb: 2 }}>
        Timeline
      </Typography>

      <Timeline position="right">
        {/* Stage 1: Order Placed */}
        <TimelineItem>
          <TimelineOppositeContent sx={{ flex: 0.3 }} color="text.secondary">
            Oct 24, 09:30 AM
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot color="success">
              <ShoppingCartIcon fontSize="small" />
            </TimelineDot>
            <TimelineConnector sx={{ bgcolor: "success.main" }} />
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="h6" component="span" sx={{ fontSize: "1rem" }}>
              Order Placed
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your order has been confirmed.
            </Typography>
          </TimelineContent>
        </TimelineItem>

        {/* Stage 2: Packed */}
        <TimelineItem>
          <TimelineOppositeContent sx={{ flex: 0.3 }} color="text.secondary">
            Oct 25, 11:00 AM
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot color="success">
              <InventoryIcon fontSize="small" />
            </TimelineDot>
            <TimelineConnector sx={{ bgcolor: "success.main" }} />
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="h6" component="span" sx={{ fontSize: "1rem" }}>
              Packed
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Seller has packed your item.
            </Typography>
          </TimelineContent>
        </TimelineItem>

        {/* Stage 3: Shipped/In Transit (Active) */}
        <TimelineItem>
          <TimelineOppositeContent sx={{ flex: 0.3 }} color="text.secondary">
            Oct 26, 08:15 AM
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot color="warning">
              <LocalShippingIcon fontSize="small" />
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="h6" component="span" sx={{ fontSize: "1rem" }}>
              Shipped
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Out for delivery. Your item is on the way.
            </Typography>
          </TimelineContent>
        </TimelineItem>

        {/* Stage 4: Delivered (Future) */}
        <TimelineItem>
          <TimelineOppositeContent sx={{ flex: 0.3 }} color="text.secondary">
            --:--
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot color="grey">
              <HomeIcon fontSize="small" />
            </TimelineDot>
          </TimelineSeparator>
          <TimelineContent>
            <Typography
              variant="h6"
              component="span"
              color="text.secondary"
              sx={{ fontSize: "1rem" }}
            >
              Delivered
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Estimated: Oct 27
            </Typography>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </Paper>
  );
};

export default OrderTimeline;
