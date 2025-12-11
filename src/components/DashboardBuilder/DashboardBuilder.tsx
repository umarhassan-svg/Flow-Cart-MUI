/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Stack,
  Typography,
  Drawer,
  IconButton,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import WidgetSelector from "./WidgetSelector/WidgetSelector";
import DashboardCanvas from "./DashboardCanvas/DashBoardCanvas";
import WidgetSettings from "./Widget/WidgetSettings/WidgetSettings";
import LayoutMain from "../layout/layoutMain";
import type {
  Widget as W,
  DashboardLayoutItem,
  ChartType,
  WidgetType,
} from "../../types/Dashboardbuilder";
import {
  generateId,
  saveDashboard,
  loadDashboard,
} from "../../utils/Dashboardutils";

export default function DashboardBuilder() {
  const [widgets, setWidgets] = useState<W[]>(() => {
    const saved = loadDashboard();
    return saved?.widgets || [];
  });
  const [layout, setLayout] = useState<DashboardLayoutItem[]>(() => {
    const saved = loadDashboard();
    return saved?.layout || [];
  });
  const [editingWidgetId, setEditingWidgetId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    // autosave lightly (you can debounce for real app)
    saveDashboard(widgets, layout);
  }, [widgets, layout]);

  const handleDropNew = (type: string, x?: number, y?: number) => {
    const id = generateId();

    const [baseType, subType] = type.split(":");
    const resolvedType = (baseType as WidgetType) || "chart";
    const chartType = (subType as ChartType) || "line";

    const defaultInline =
      resolvedType === "table"
        ? "Product,Units,Revenue\nA,120,2400\nB,80,1400\nC,200,3800"
        : "Jan,10\nFeb,20\nMar,15\nApr,25\nMay,30";

    const newWidget: W = {
      id,
      type: resolvedType,
      title: `${
        (resolvedType === "chart" ? chartType : resolvedType)
          .charAt(0)
          .toUpperCase() +
        (resolvedType === "chart" ? chartType : resolvedType).slice(1)
      } Widget`,
      config: {
        inlineData: defaultInline,
        chartType: resolvedType === "chart" ? chartType : undefined,
      },
    };
    setWidgets((s) => [...s, newWidget]);

    // Use provided position or calculate next available position
    let newX = x !== undefined ? x : 0;
    let newY = y !== undefined ? y : 0;

    // If no position provided, find the next available spot
    if (x === undefined || y === undefined) {
      if (layout.length > 0) {
        // Find the rightmost widget in the first row to place next to it
        const firstRowWidgets = layout.filter((l) => l.y === 0);
        if (firstRowWidgets.length > 0) {
          const rightmost = firstRowWidgets.reduce((prev, current) =>
            prev.x + prev.w > current.x + current.w ? prev : current
          );
          const nextX = rightmost.x + rightmost.w;
          // If there's space in the first row, use it; otherwise go to next row
          if (nextX + 4 <= 12) {
            newX = nextX;
            newY = 0;
          } else {
            newY = Math.max(...layout.map((l) => l.y + l.h));
            newX = 0;
          }
        } else {
          newX = 0;
          newY = 0;
        }
      } else {
        newX = 0;
        newY = 0;
      }
    }

    setLayout((s) => [...s, { i: id, x: newX, y: newY, w: 4, h: 6 }]);
  };

  const handleLayoutChange = (newLayout: DashboardLayoutItem[]) =>
    setLayout(newLayout);

  const handleEdit = (id: string) => {
    setEditingWidgetId(id);
    setShowSettings(true);
  };

  const handleDelete = (id: string) => {
    setWidgets((s) => s.filter((w) => w.id !== id));
    setLayout((s) => s.filter((l) => l.i !== id));
  };

  const handleSaveSettings = (id: string, config: any, title?: string) => {
    setWidgets((s) =>
      s.map((w) =>
        w.id === id
          ? {
              ...w,
              config: { ...w.config, ...config },
              title: title ?? w.title,
            }
          : w
      )
    );
  };

  const handleAddDefault = () => handleDropNew("chart");

  const editingWidget = widgets.find((w) => w.id === editingWidgetId) || null;

  return (
    <LayoutMain>
      <Box
        sx={{
          position: "relative",
          pt: 1,
          height: "84vh",
          overflow: "hidden",
        }}
      >
        {/* Main Canvas Area */}
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            p: 0,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
            }}
          >
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{
                bgcolor: "background.paper",
                boxShadow: 2,
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Dashboard Builder (Alpha Version)
            </Typography>
          </Box>
          <Box sx={{ flex: 1, overflow: "auto" }}>
            <DashboardCanvas
              widgets={widgets}
              layout={layout}
              onLayoutChange={handleLayoutChange}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDropNew={handleDropNew}
            />
          </Box>
        </Box>

        {/* Drawer Sidebar */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{
            // Allow drop events to pass through when drawer is closing
            disableEnforceFocus: true,
          }}
          PaperProps={{
            sx: {
              width: 320,
              boxShadow: 4,
            },
          }}
        >
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              p: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Widgets
              </Typography>
              <IconButton
                size="small"
                onClick={() => setDrawerOpen(false)}
                sx={{
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ flex: 1, overflow: "auto" }}>
              <WidgetSelector onDragStart={() => setDrawerOpen(false)} />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1.5}>
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                onClick={() => {
                  handleAddDefault();
                  setDrawerOpen(false);
                }}
                fullWidth
                sx={{ textTransform: "none" }}
              >
                Add Chart Widget
              </Button>
              <Button
                startIcon={<SaveIcon />}
                variant="contained"
                onClick={() => {
                  saveDashboard(widgets, layout);
                  setDrawerOpen(false);
                }}
                color="primary"
                fullWidth
                sx={{ textTransform: "none" }}
              >
                Save Dashboard
              </Button>
            </Stack>
          </Box>
        </Drawer>

        {/* Settings Dialog */}
        <WidgetSettings
          open={showSettings}
          widget={editingWidget}
          onClose={() => {
            setShowSettings(false);
            setEditingWidgetId(null);
          }}
          onSave={handleSaveSettings}
        />
      </Box>
    </LayoutMain>
  );
}
