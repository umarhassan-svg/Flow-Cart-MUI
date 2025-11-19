// src/components/cart/CartItemCard.tsx
import React, { useCallback } from "react";
import { Box, IconButton, Stack, Typography, TextField } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import type { CartItem } from "../../context/CartContext";
import { styled } from "@mui/material/styles";

type Props = {
  item: CartItem;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onSetQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
};

const Thumb = styled("img")(({ theme }) => ({
  width: 72,
  height: 72,
  objectFit: "cover",
  borderRadius: 8,
  border: `1px solid ${theme.palette.divider}`,
}));

const CartItemCard: React.FC<Props> = ({
  item,
  onIncrement,
  onDecrement,
  onSetQty,
  onRemove,
}) => {
  const price = item.product.discountPrice ?? item.product.price;
  const formatted = new Intl.NumberFormat(undefined, {
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
    <Stack direction="row" spacing={2} alignItems="center" sx={{ py: 1 }}>
      <Box>
        <Thumb
          src={item.product.images?.[0] ?? ""}
          alt={item.product.title}
          loading="lazy"
        />
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontWeight: 700 }}>
          {item.product.title}
        </Typography>

        <Typography variant="caption" color="text.secondary" noWrap>
          {item.product.category ?? ""}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {formatted}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            x {item.qty}
          </Typography>
        </Stack>
      </Box>

      {/* qty controls */}
      <Stack direction="row" spacing={0.5} alignItems="center">
        <IconButton
          size="small"
          aria-label="decrement"
          onClick={() => onDecrement(item.id)}
        >
          <RemoveIcon fontSize="small" />
        </IconButton>

        <TextField
          size="small"
          inputProps={{ style: { textAlign: "center", width: 48 }, min: 1 }}
          value={item.qty}
          onChange={handleChangeQty}
        />

        <IconButton
          size="small"
          aria-label="increment"
          onClick={() => onIncrement(item.id)}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Box>
        <IconButton
          aria-label="remove item"
          color="error"
          onClick={() => onRemove(item.id)}
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    </Stack>
  );
};

export default React.memo(CartItemCard);
