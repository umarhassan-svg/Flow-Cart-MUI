/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import RGL, { type Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import WidgetComponent from "./../Widget/Widget";
import type {
  Widget,
  DashboardLayoutItem,
} from "../../../types/Dashboardbuilder";

const GridLayout = (RGL as any).WidthProvider(RGL);

interface Props {
  widgets: Widget[];
  layout: DashboardLayoutItem[];
  onLayoutChange: (layout: DashboardLayoutItem[]) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDropNew: (type: string, x?: number, y?: number) => void;
}

export default function DashboardCanvas({
  widgets,
  layout,
  onLayoutChange,
  onEdit,
  onDelete,
  onDropNew,
}: Props) {
  const [containerWidth, setContainerWidth] = useState(1200);

  useEffect(() => {
    const updateWidth = () => {
      const container = document.getElementById("dashboard-canvas-container");
      if (container) {
        setContainerWidth(container.offsetWidth - 16); // Account for padding
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const handleLayoutChange = (newLayout: Layout[]) => {
    // map to our DashboardLayoutItem type
    const mapped = newLayout.map((it) => ({
      i: it.i,
      x: it.x,
      y: it.y,
      w: it.w,
      h: it.h,
    }));
    onLayoutChange(mapped);
  };

  const handleDrop = (_: Layout[], layoutItem: Layout | null, e: DragEvent) => {
    const type = (e.dataTransfer as DataTransfer).getData("widget/type");
    if (!type || !layoutItem) return;
    // Use the drop position from react-grid-layout
    onDropNew(type, layoutItem.x, layoutItem.y);
  };

  const rglLayout: Layout[] = layout.map((l) => ({
    i: l.i,
    x: l.x,
    y: l.y,
    w: l.w,
    h: l.h,
  }));

  return (
    <Box
      id="dashboard-canvas-container"
      sx={{
        width: "100%",
        minHeight: 600,
        bgcolor: "background.default",
        borderRadius: 2,
        p: 2,
        border: 1,
        borderColor: "divider",
      }}
    >
      {widgets.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 400,
            color: "text.secondary",
            border: 2,
            borderStyle: "dashed",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          Drag widgets here to get started
        </Box>
      ) : (
        <GridLayout
          className="layout"
          layout={rglLayout}
          cols={12}
          rowHeight={30}
          width={containerWidth}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".widget-drag-handle"
          isDroppable
          isResizable
          margin={[16, 16]}
          onDrop={handleDrop}
          compactType={null}
          preventCollision={false}
        >
          {widgets.map((w) => {
            const layoutItem = layout.find((l) => l.i === w.id) || {
              x: 0,
              y: 0,
              w: 4,
              h: 6,
            };
            return (
              <Box
                key={w.id}
                data-grid={layoutItem}
                sx={{
                  height: "100%",
                  "& .react-resizable-handle": {
                    opacity: 0.5,
                    "&:hover": {
                      opacity: 1,
                    },
                  },
                }}
              >
                <WidgetComponent
                  widget={w}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </Box>
            );
          })}
        </GridLayout>
      )}
    </Box>
  );
}
