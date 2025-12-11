import { useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Widget as W } from "../../../types/Dashboardbuilder";
import { parseInlineData, parseInlineTable } from "../../../utils/helpers";
import { LineChart, BarChart, PieChart } from "@mui/x-charts";

interface Props {
  widget: W;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function Widget({ widget, onEdit, onDelete }: Props) {
  const data = useMemo(
    () => parseInlineData(widget.config.inlineData || ""),
    [widget.config.inlineData]
  );

  // Generate a stable random value for metrics without data
  const [metricValue] = useState(() => Math.floor(1000 + Math.random() * 9000));

  const renderBody = () => {
    if (widget.type === "metric") {
      const value = data.length ? data[0].value : metricValue;
      return (
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 180,
            background: "linear-gradient(135deg, #e3f2fd 0%, #fff 100%)",
            borderRadius: 2,
            gap: 1,
          }}
        >
          <Typography
            variant="overline"
            color="primary.main"
            sx={{ letterSpacing: 1 }}
          >
            {widget.title}
          </Typography>
          <Typography variant="h2" fontWeight="bold" color="primary.main">
            {value.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {widget.config.dataSource || "No data source"}
          </Typography>
        </CardContent>
      );
    }

    if (widget.type === "table") {
      const table = parseInlineTable(widget.config.inlineData || "");
      return (
        <CardContent
          sx={{
            p: 0,
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              maxHeight: "100%",
            }}
          >
            <Box
              component="table"
              sx={{
                width: "100%",
                borderCollapse: "collapse",
                "& th": {
                  borderBottom: 2,
                  borderColor: "divider",
                  fontWeight: 600,
                  textAlign: "left",
                  py: 1,
                  px: 2,
                  position: "sticky",
                  top: 0,
                  bgcolor: "background.paper",
                  zIndex: 1,
                },
                "& td": {
                  borderBottom: 1,
                  borderColor: "divider",
                  py: 1,
                  px: 2,
                },
                "& tr:hover": {
                  bgcolor: "action.hover",
                },
                "& tr:last-child td": {
                  borderBottom: "none",
                },
              }}
            >
              <thead>
                <tr>
                  {table.headers.map((h, idx) => (
                    <th
                      key={idx}
                      style={{
                        textAlign:
                          idx === table.headers.length - 1 ? "right" : "left",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={table.headers.length || 2}
                      style={{ textAlign: "center", color: "text.secondary" }}
                    >
                      No data available
                    </td>
                  </tr>
                ) : (
                  table.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, idx) => (
                        <td
                          key={idx}
                          style={{
                            textAlign:
                              idx === row.length - 1 ? "right" : "left",
                            fontWeight: idx === row.length - 1 ? 500 : 400,
                          }}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </Box>
          </Box>
        </CardContent>
      );
    }

    // default: chart
    const chartType = widget.config.chartType || "line";

    if (!data || data.length === 0) {
      return (
        <CardContent
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 200,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No data available
          </Typography>
        </CardContent>
      );
    }

    const xAxisData = data.map((d) => d.label);
    const seriesData = data.map((d) => d.value);

    return (
      <CardContent
        sx={{ height: "100%", p: 2, display: "flex", flexDirection: "column" }}
      >
        <Box sx={{ width: "100%", flex: 1, minHeight: 200 }}>
          {chartType === "line" && (
            <LineChart
              width={undefined}
              height={undefined}
              series={[
                {
                  data: seriesData,
                  label: widget.config.dataSource || "Value",
                  color: "#1976d2",
                },
              ]}
              xAxis={[
                {
                  id: "line-x-axis",
                  data: xAxisData,
                  scaleType: "point",
                },
              ]}
            />
          )}
          {chartType === "bar" && (
            <BarChart
              width={undefined}
              height={undefined}
              series={[
                {
                  data: seriesData,
                  label: widget.config.dataSource || "Value",
                  color: "#1976d2",
                },
              ]}
              xAxis={[
                {
                  id: "bar-x-axis",
                  data: xAxisData,
                  scaleType: "band",
                },
              ]}
            />
          )}
          {chartType === "pie" && (
            <PieChart
              width={undefined}
              height={undefined}
              series={[
                {
                  data: data.map((d) => ({
                    id: d.label,
                    value: d.value,
                    label: d.label,
                  })),
                },
              ]}
            />
          )}
        </Box>
      </CardContent>
    );
  };

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxShadow: 2,
        "&:hover": {
          boxShadow: 4,
        },
        transition: "box-shadow 0.3s ease-in-out",
      }}
    >
      <CardHeader
        title={
          <Box
            className="widget-drag-handle"
            sx={{
              cursor: "grab",
              userSelect: "none",
              "&:active": {
                cursor: "grabbing",
              },
            }}
          >
            {widget.title}
          </Box>
        }
        sx={{
          pb: 1,
          "& .MuiCardHeader-action": {
            margin: 0,
          },
          "& .MuiCardHeader-title": {
            flex: 1,
          },
        }}
        action={
          <Box
            sx={{ display: "flex", gap: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(widget.id);
              }}
              sx={{
                "&:hover": {
                  bgcolor: "action.hover",
                  color: "primary.main",
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(widget.id);
              }}
              sx={{
                "&:hover": {
                  bgcolor: "error.light",
                  color: "error.contrastText",
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        }
      />
      <Box sx={{ flex: 1, overflow: "hidden" }}>{renderBody()}</Box>
    </Card>
  );
}
