// src/components/products/ProductDetailBox/ProductsDetailBox.tsx
import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  CardContent,
  Chip,
  IconButton,
  Rating,
  Stack,
  Typography,
  TextField,
  Grid,
  Divider,
  Skeleton,
  useTheme,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShareIcon from "@mui/icons-material/Share";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

import type { Product } from "../../../types/Product";

/* styles tokens import */
import {
  RootCard,
  MainImage,
  Thumb,
  PriceStrong,
  cardContentSx,
  imageWrapperSx,
  thumbnailsStackSx,
  thumbBoxSx,
  metaRowSx,
  priceAreaSx,
  shippingSx,
  buyGridContainerSx,
  qtyGridItemSx,
  actionButtonSx,
  iconsGroupSx,
  tagsRowSx,
  detailsSx,
  titleSx,
} from "./styles";
import { useAuth } from "../../../context/AuthContext";
import { useNotifications } from "../../../hooks/useNotification";

type Props = {
  product: Product;
  onAddToCart?: (product: Product, qty?: number) => void;
  onBuyNow?: (product: Product, qty?: number) => void;
};

const ProductDetailBox = ({ product, onAddToCart, onBuyNow }: Props) => {
  const theme = useTheme();
  const images = product.images ?? [];
  const [index, setIndex] = useState<number>(0);
  const [qty, setQty] = useState<number>(1);
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);
  const { can } = useAuth();
  const primary = images[index] ?? "";
  const { success } = useNotifications();

  const priceDisplay = useMemo(() => {
    const currency = product.currency ?? "USD";
    const fmt = (n: number) =>
      new Intl.NumberFormat(undefined, { style: "currency", currency }).format(
        n
      );

    const price = product.price;
    const discount = product.discountPrice;
    const savings = discount && price > discount ? price - discount : 0;

    return {
      price: fmt(price),
      discount: discount ? fmt(discount) : null,
      savings: savings > 0 ? fmt(savings) : null,
    };
  }, [product.price, product.discountPrice, product.currency]);

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const lowStock =
    product.stock !== undefined && product.stock > 0 && product.stock <= 5;

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(1, Math.floor(Number(e.target.value) || 1));
    setQty(Math.min(v, product.stock ?? 9999));
  };

  return (
    <RootCard>
      <CardContent sx={cardContentSx}>
        <Grid container spacing={3}>
          {/* LEFT SECTION */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={imageWrapperSx}>
              {!imgLoaded && (
                <Skeleton
                  variant="rectangular"
                  sx={{ borderRadius: 2 }}
                  height={450}
                />
              )}

              {primary && (
                <MainImage
                  src={primary}
                  alt={product.title}
                  $loaded={imgLoaded}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgLoaded(true)}
                />
              )}
            </Box>

            {/* Thumbnails */}
            {images.length > 1 && (
              <Stack direction="row" spacing={1} sx={thumbnailsStackSx}>
                {images.map((src, i) => (
                  <Box key={src + i} sx={thumbBoxSx(i === index)(theme)}>
                    <Thumb
                      src={src}
                      alt={`${product.title} ${i + 1}`}
                      onClick={() => setIndex(i)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") setIndex(i);
                      }}
                      role="button"
                      tabIndex={0}
                      loading="lazy"
                    />
                  </Box>
                ))}
              </Stack>
            )}
          </Grid>

          {/* RIGHT SECTION */}
          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{
              justifyContent: "center",
              display: "flex",
            }}
          >
            <Stack spacing={2}>
              {/* Title + Rating */}
              <Typography sx={titleSx}>{product.title}</Typography>

              <Stack sx={metaRowSx} direction="row">
                <Rating
                  value={Math.round((product.rating ?? 0) * 2) / 2}
                  readOnly
                  precision={0.5}
                  size="small"
                />

                <Typography variant="body2" color="text.secondary">
                  {product.reviewsCount ?? 0} reviews
                </Typography>

                {lowStock && (
                  <Chip
                    label={`Low stock (${product.stock})`}
                    color="warning"
                    size="small"
                  />
                )}

                {isOutOfStock && (
                  <Chip label="Out of stock" color="error" size="small" />
                )}
              </Stack>

              <Divider />

              {/* Price Section */}
              {priceDisplay.discount ? (
                <Stack sx={priceAreaSx}>
                  <PriceStrong variant="h4">
                    {priceDisplay.discount}
                  </PriceStrong>
                  <Typography
                    variant="body2"
                    sx={{
                      textDecoration: "line-through",
                      color: "text.disabled",
                    }}
                  >
                    {priceDisplay.price}
                  </Typography>
                  {priceDisplay.savings && (
                    <Chip
                      icon={<LocalOfferIcon />}
                      label={`Save ${priceDisplay.savings}`}
                      color="success"
                      size="small"
                    />
                  )}
                </Stack>
              ) : (
                <PriceStrong variant="h4">{priceDisplay.price}</PriceStrong>
              )}

              {/* Free shipping */}
              <Stack sx={shippingSx} direction="row">
                <LocalShippingIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Free shipping on orders over $50
                </Typography>
              </Stack>

              <Divider />

              {/* BUY CONTROLS — responsive Grid-based layout */}
              <Grid
                container
                spacing={1.5}
                alignItems="center"
                sx={buyGridContainerSx}
              >
                <Grid size={{ xs: 12, sm: "auto" }} sx={qtyGridItemSx}>
                  {can("cart:update") || isOutOfStock ? (
                    <TextField
                      label="Qty"
                      type="number"
                      size="small"
                      value={qty}
                      onChange={handleQtyChange}
                      inputProps={{
                        min: 1,
                        max: product.stock ?? 9999,
                        "aria-label": "Quantity",
                      }}
                      fullWidth
                    />
                  ) : null}
                </Grid>
                {(can("cart:update") || isOutOfStock) && (
                  <Grid size={{ xs: 12, sm: "auto" }}>
                    <Button
                      variant="contained"
                      startIcon={<AddShoppingCartIcon />}
                      onClick={() => onAddToCart?.(product, qty)}
                      disabled={isOutOfStock}
                      sx={actionButtonSx}
                      aria-label="Add to cart"
                    >
                      Add to cart
                    </Button>
                  </Grid>
                )}

                {can("orders:create") && !isOutOfStock && (
                  <Grid size={{ xs: 12, sm: "auto" }}>
                    <Button
                      variant="outlined"
                      onClick={() => onBuyNow?.(product, qty)}
                      disabled={isOutOfStock}
                      sx={actionButtonSx}
                      aria-label="Buy now"
                    >
                      Buy now
                    </Button>
                  </Grid>
                )}

                <Grid size={{ xs: 12, sm: "auto" }} sx={iconsGroupSx}>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton
                      aria-label="add to wishlist"
                      size="small"
                      onClick={() => {
                        success("Item added to favourites");
                      }}
                    >
                      <FavoriteBorderIcon />
                    </IconButton>
                    <IconButton aria-label="share product" size="small">
                      <ShareIcon />
                    </IconButton>
                  </Stack>
                </Grid>
              </Grid>

              <Divider />

              {/* Tags */}
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={tagsRowSx}>
                {(product.tags ?? []).slice(0, 8).map((t) => (
                  <Chip key={t} label={t} size="small" />
                ))}
              </Stack>

              {/* Details */}
              <Box>
                <Typography variant="subtitle2">Details</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={detailsSx}
                >
                  {product.description}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </RootCard>
  );
};

export default React.memo(ProductDetailBox);
