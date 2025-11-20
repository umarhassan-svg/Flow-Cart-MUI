import { Stack, Avatar, Box, Typography } from "@mui/material";
import type { CartItem } from "../../../types/cart";

export default function ShowOrderItem({ item }: { item: CartItem }) {
  const p = item.product;
  const image = p.images && p.images.length ? p.images[0] : undefined;
  const price = p.discountPrice ?? p.price;

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Avatar variant="rounded" src={image} sx={{ width: 56, height: 56 }} />
      <Box>
        <Typography variant="body2" fontWeight={600}>
          {p.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {p.id} • Qty: {item.qty}
        </Typography>
        <Typography variant="body2">
          {price.toFixed(2)} {p.currency ?? "USD"} x {item.qty} ={" "}
          {(price * item.qty).toFixed(2)}
        </Typography>
      </Box>
    </Stack>
  );
}
