import React, { useCallback } from "react";
import {
  Box,
  IconButton,
  Stack,
  Typography,
  TextField,
  Paper,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import type { CartItem } from "../../types/cart";
import { styled } from "@mui/material/styles";

type Props = {
  item: CartItem;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onSetQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
};

const Thumb = styled("img")(({ theme }) => ({
  width: 80,
  height: 80,
  objectFit: "cover",
  borderRadius: 8,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.action.hover,
}));

const CartItemCard = ({
  item,
  onIncrement,
  onDecrement,
  onSetQty,
  onRemove,
}: Props) => {
  const theme = useTheme();

  const price = item.product.discountPrice ?? item.product.price;
  const formattedPrice = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: item.product.currency ?? "USD",
  }).format(price);

  const handleChangeQty = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Math.max(1, Math.floor(Number(e.target.value) || 1));
      onSetQty(item.id, v);
    },
    [item.id, onSetQty]
  );

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: "background.paper",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        width="100%"
      >
        {/* SECTION 1: Image and Details */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ flex: 1, width: "100%" }}
        >
          <Box>
            <Thumb
              src={item.product.images?.[0] ?? ""}
              alt={item.product.title}
              loading="lazy"
            />
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 500,
                lineHeight: 1.2,
                mb: 0.5,
              }}
            >
              {item.product.title}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block" }}
            >
              {item.product.category ?? "Product"}
            </Typography>

            {/* Mobile Only: Price shows under title for compact view, or remove this to keep price only at bottom */}
            <Typography
              variant="body2"
              fontWeight="bold"
              color="primary"
              sx={{ display: { xs: "block", sm: "none" }, mt: 1 }}
            >
              {formattedPrice}
            </Typography>
          </Box>
        </Stack>

        {/* SECTION 2: Actions (Price, Qty, Delete) */}
        <Stack
          direction="row"
          spacing={{ xs: 0, sm: 3 }}
          alignItems="center"
          justifyContent={{ xs: "space-between", sm: "flex-end" }}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          {/* Desktop Price (Hidden on Mobile) */}
          <Typography
            variant="body1"
            fontWeight="bold"
            sx={{
              display: { xs: "none", sm: "block" },
              minWidth: 80,
              textAlign: "right",
            }}
          >
            {formattedPrice}
          </Typography>

          {/* Quantity Controls */}
          <Stack
            direction="row"
            spacing={0}
            alignItems="center"
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
            }}
          >
            <IconButton
              size="small"
              onClick={() => onDecrement(item.id)}
              disabled={item.qty <= 1}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>

            <TextField
              variant="standard"
              InputProps={{ disableUnderline: true }}
              inputProps={{
                style: {
                  textAlign: "center",
                  width: 40,
                  padding: 0,
                  fontSize: 14,
                },
                min: 1,
              }}
              value={item.qty}
              onChange={handleChangeQty}
            />

            <IconButton size="small" onClick={() => onIncrement(item.id)}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Stack>

          {/* Delete Button */}
          <IconButton
            aria-label="remove item"
            color="error"
            onClick={() => onRemove(item.id)}
            sx={{ ml: { xs: 0, sm: 1 } }}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default React.memo(CartItemCard);
