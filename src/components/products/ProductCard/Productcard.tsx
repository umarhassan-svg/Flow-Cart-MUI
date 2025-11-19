// src/components/products/ProductCard.tsx
import React, { useCallback, useMemo } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  CardContent,
  CardMedia,
  Chip,
  Rating,
  Stack,
  Typography,
  Tooltip,
  Skeleton,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import StarIcon from "@mui/icons-material/Star";
import type { Product } from "../../../services/product.service";
import { useIntersection } from "../../../hooks/useInteraction";
import {
  StyledCard,
  mediaSx,
  contentSx,
  titleSx,
  descriptionSx,
  priceRowSx,
  priceSx,
  oldPriceSx,
  lowStockSx,
  tagsSx,
  actionsSx,
  actionLeftSx,
  actionRightSx,
  avatarSx,
  badgeSx,
} from "./styles";

type Props = {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onClick: (product: Product) => void;
  showActions?: boolean;
  loading?: boolean;
};

const ProductCard: React.FC<Props> = React.memo(function ProductCard({
  product,
  onAddToCart,
  onClick,
  showActions = true,
}) {
  const { ref, isIntersecting } = useIntersection<HTMLDivElement>();
  const primaryImage = product.images?.[0];

  const handleAdd = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onAddToCart?.(product);
    },
    [onAddToCart, product]
  );

  const priceDisplay = useMemo(() => {
    const currency = product.currency ?? "USD";
    const format = (n: number) =>
      new Intl.NumberFormat(undefined, { style: "currency", currency }).format(
        n
      );
    return {
      price: format(product.price),
      discount: product.discountPrice
        ? format(product.discountPrice)
        : undefined,
      percent:
        product.discountPrice && product.price
          ? Math.round(
              ((product.price - product.discountPrice) / product.price) * 100
            )
          : undefined,
    };
  }, [product.price, product.discountPrice, product.currency]);

  return (
    <StyledCard
      onClick={() => onClick(product)}
      role="article"
      aria-label={`Product ${product.title}`}
    >
      <Box ref={ref} sx={{ position: "relative" }}>
        {!isIntersecting && (
          <Skeleton
            variant="rectangular"
            animation="wave"
            sx={{ height: 180 }}
          />
        )}

        {isIntersecting && primaryImage ? (
          <CardMedia
            component="img"
            height="180"
            image={primaryImage}
            alt={product.title}
            loading="lazy"
            sx={mediaSx}
          />
        ) : null}

        {/* moved badge to top-right with cleaner style */}
        {product.discountPrice && (
          <Badge
            badgeContent={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <LocalOfferIcon fontSize="small" />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {priceDisplay.percent}%
                </Typography>
              </Box>
            }
            color="error"
            sx={badgeSx}
          />
        )}
      </Box>

      <CardContent sx={contentSx}>
        <Typography sx={titleSx} title={product.title}>
          {product.title}
        </Typography>

        <Typography sx={descriptionSx} title={product.description}>
          {product.description}
        </Typography>

        {/* Price + stock */}
        <Box sx={priceRowSx}>
          {product.discountPrice ? (
            <Stack direction="row" spacing={1} alignItems="baseline">
              <Typography sx={priceSx}>{priceDisplay.discount}</Typography>
              <Typography sx={oldPriceSx}>{priceDisplay.price}</Typography>
            </Stack>
          ) : (
            <Typography sx={priceSx}>{priceDisplay.price}</Typography>
          )}
        </Box>

        {typeof product.stock === "number" && product.stock <= 5 && (
          <Typography sx={lowStockSx}>Low stock ({product.stock})</Typography>
        )}

        {/* tags */}
        <Box sx={tagsSx}>
          {(product.tags ?? []).slice(0, 5).map((t) => (
            <Chip key={t} label={t} size="small" />
          ))}
        </Box>
        {/* Left side: reviews / rating */}
        <Box sx={actionLeftSx}>
          <Rating
            value={Math.round((product.rating ?? 0) * 2) / 2}
            precision={0.5}
            readOnly
            size="small"
            icon={<StarIcon fontSize="inherit" />}
          />
          <Typography variant="caption" color="text.secondary">
            ({product.reviewsCount ?? 0})
          </Typography>
        </Box>
      </CardContent>

      {showActions && (
        <Box component="footer" sx={actionsSx}>
          {/* Right side: add to cart + category avatar */}
          <Box sx={actionRightSx}>
            <Button
              size="small"
              startIcon={<AddShoppingCartIcon />}
              variant="contained"
              onClick={handleAdd}
              disabled={typeof product.stock === "number" && product.stock <= 0}
              aria-label={`Add ${product.title} to cart`}
              sx={{ borderRadius: 1.5, whiteSpace: "nowrap", px: 1.5 }}
            >
              Add to cart
            </Button>

            <Tooltip title={product.category ?? "Category"}>
              <Avatar sx={avatarSx}>
                {product.category
                  ? product.category.charAt(0).toUpperCase()
                  : "?"}
              </Avatar>
            </Tooltip>
          </Box>
        </Box>
      )}
    </StyledCard>
  );
});

export default ProductCard;
