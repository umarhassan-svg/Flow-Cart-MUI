import React from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import GridViewIcon from "@mui/icons-material/GridView";
import PieChartIcon from "@mui/icons-material/PieChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";

const items: { type: string; label: string; icon: React.ReactNode }[] = [
  { type: "chart:line", label: "Line Chart", icon: <ShowChartIcon /> },
  { type: "chart:bar", label: "Bar Chart", icon: <BarChartIcon /> },
  { type: "chart:pie", label: "Pie Chart", icon: <PieChartIcon /> },
  { type: "table", label: "Table", icon: <TableChartIcon /> },
  { type: "metric", label: "Metric", icon: <GridViewIcon /> },
];

interface Props {
  onDragStart?: () => void;
}

export default function WidgetSelector({ onDragStart }: Props) {
  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData("widget/type", type);
    // set an allowed effect
    e.dataTransfer.effectAllowed = "copy";
    // Close drawer when dragging starts
    if (onDragStart) {
      onDragStart();
    }
  };

  return (
    <Box>
      <List dense>
        {items.map((it, index) => (
          <React.Fragment key={it.type}>
            <ListItemButton
              draggable
              onDragStart={(e) => handleDragStart(e, it.type)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                "&:hover": {
                  bgcolor: "action.hover",
                },
                "&:active": {
                  bgcolor: "action.selected",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: "primary.main" }}>
                {it.icon}
              </ListItemIcon>
              <ListItemText
                primary={it.label}
                primaryTypographyProps={{
                  fontWeight: 500,
                }}
              />
            </ListItemButton>
            {index < items.length - 1 && <Divider sx={{ my: 0.5 }} />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
}
