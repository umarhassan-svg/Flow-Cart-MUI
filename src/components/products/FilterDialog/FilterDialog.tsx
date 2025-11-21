// src/components/products/FilterDialog.tsx
import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

export type Filters = {
  category?: string | null;
  tags?: string[];
  minPrice?: number | null;
  maxPrice?: number | null;
  minRating?: number | null;
  onlyInStock?: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onApply: (f: Filters) => void;
  categories?: string[];
  tagOptions?: string[];
  defaultFilters?: Filters;
};

const FilterDialog = ({
  open,
  onClose,
  onApply,
  categories = [],
  tagOptions = [],
  defaultFilters,
}: Props) => {
  const [category, setCategory] = useState<string | "">(
    (defaultFilters?.category as string) ?? ""
  );
  const [tags, setTags] = useState<string[]>(defaultFilters?.tags ?? []);
  const [priceRange, setPriceRange] = useState<number[]>([
    defaultFilters?.minPrice ?? 0,
    defaultFilters?.maxPrice ?? 1000,
  ]);
  const [minRating, setMinRating] = useState<number>(
    defaultFilters?.minRating ?? 0
  );
  const [onlyInStock, setOnlyInStock] = useState<boolean>(
    defaultFilters?.onlyInStock ?? false
  );

  const handleToggleTag = (t: string) => {
    setTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const reset = () => {
    setCategory("");
    setTags([]);
    setPriceRange([0, 1000]);
    setMinRating(0);
    setOnlyInStock(false);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Filter products</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value as string)}
            >
              <MenuItem value="">All</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <Typography variant="subtitle2">Price range</Typography>
            <Slider
              value={priceRange}
              onChange={(_, v) => setPriceRange(v as number[])}
              valueLabelDisplay="auto"
              min={0}
              max={5000}
            />
            <Typography variant="caption">
              From {priceRange[0]} to {priceRange[1]}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Tags
            </Typography>
            <Stack direction="row" gap={1} flexWrap="wrap">
              {tagOptions.map((t) => (
                <Button
                  key={t}
                  size="small"
                  variant={tags.includes(t) ? "contained" : "outlined"}
                  onClick={() => handleToggleTag(t)}
                >
                  {t}
                </Button>
              ))}
            </Stack>
          </Box>

          <FormControl fullWidth>
            <InputLabel>Minimum rating</InputLabel>
            <Select
              size="small"
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              label="Minimum rating"
            >
              {[0, 1, 2, 3, 4].map((r) => (
                <MenuItem key={r} value={r}>
                  {r}+
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
              />
            }
            label="Only show in-stock"
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={reset}>Reset</Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() =>
            onApply({
              category: category || undefined,
              tags,
              minPrice: priceRange[0],
              maxPrice: priceRange[1],
              minRating: minRating || undefined,
              onlyInStock,
            })
          }
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterDialog;
