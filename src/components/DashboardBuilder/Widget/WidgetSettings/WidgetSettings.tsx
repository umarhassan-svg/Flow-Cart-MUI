/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
} from "@mui/material";
import type { Widget, WidgetConfig } from "../../../../types/Dashboardbuilder";

interface Props {
  open: boolean;
  widget?: Widget | null;
  onClose: () => void;
  onSave: (id: string, config: WidgetConfig, title?: string) => void;
}

export default function WidgetSettings({
  open,
  widget,
  onClose,
  onSave,
}: Props) {
  const [title, setTitle] = useState("");
  const [config, setConfig] = useState<WidgetConfig>({ inlineData: "" });

  useEffect(() => {
    if (widget) {
      setTitle(widget.title);
      setConfig(widget.config || { inlineData: "" });
    } else {
      // Reset when dialog closes
      setTitle("");
      setConfig({ inlineData: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widget?.id, open]);

  const handleSave = () => {
    if (!widget) return;
    onSave(widget.id, config, title);
    onClose();
  };

  if (!widget) return null;

  const isChartWidget = widget.type === "chart";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="span">
          Widget Settings
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ ml: 1, textTransform: "capitalize" }}
        >
          ({widget.type})
        </Typography>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Box sx={{ mt: 2, display: "grid", gap: 3 }}>
          <TextField
            label="Widget Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            helperText="Display name for this widget"
          />

          {isChartWidget && (
            <FormControl fullWidth>
              <InputLabel id="chart-type-label">Chart Type</InputLabel>
              <Select
                labelId="chart-type-label"
                value={config.chartType || "line"}
                label="Chart Type"
                onChange={(e) =>
                  setConfig((s) => ({ ...s, chartType: e.target.value as any }))
                }
              >
                <MenuItem value="line">Line Chart</MenuItem>
                <MenuItem value="bar">Bar Chart</MenuItem>
                <MenuItem value="pie">Pie Chart</MenuItem>
              </Select>
            </FormControl>
          )}

          <TextField
            label="Data Source / Key"
            value={config.dataSource || ""}
            onChange={(e) =>
              setConfig((s) => ({ ...s, dataSource: e.target.value }))
            }
            helperText={
              widget.type === "metric"
                ? "Label or description for the metric value"
                : "Optional: URL, API key or local data key"
            }
            fullWidth
          />

          <Box>
            <TextField
              label="Inline Data (CSV format)"
              value={config.inlineData || ""}
              onChange={(e) =>
                setConfig((s) => ({ ...s, inlineData: e.target.value }))
              }
              helperText={
                widget.type === "metric"
                  ? "First row value will be used as the metric"
                  : "Format: label,value (one per line). For multi-column tables include headers: Product,Units,Revenue\\nA,120,2400"
              }
              multiline
              rows={6}
              fullWidth
              sx={{ fontFamily: "monospace" }}
            />
            {widget.type === "table" && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: "block" }}
              >
                Each row will appear as a table row
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!title.trim()}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
