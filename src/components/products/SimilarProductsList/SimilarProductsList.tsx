// src/components/products/SimilarProductsList.tsx
import React, { useEffect, useState } from "react";
import { Box, Skeleton, useTheme, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import productService, {
  type Product,
} from "../../../services/product.service";
import ProductCard from "../ProductCard/Productcard";

type Props = {
  product: Product;
  // optional: number of items to show in the row
  limit?: number;
};

const CARD_MIN_WIDTH = 300;
const CARD_MAX_WIDTH = 300;

const SimilarProductsList: React.FC<Props> = ({ product, limit = 8 }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const list = await productService.getSimilarProducts(product, limit);
        if (!mounted) return;
        setSimilar(list ?? []);
      } catch (err) {
        console.error("failed to fetch similar", err);
        if (!mounted) return;
        setSimilar([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [product, limit]);

  const handleClick = (p: Product) => {
    // navigate to product detail route (keeps SPA navigation)
    navigate(`/products/${p.id}`);
    // optionally scroll to top:
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Number of placeholders to show while loading
  const placeholderCount = Math.min(limit, 6);

  return (
    <Box>
      {loading && similar.length === 0 ? (
        // show skeleton row while loading
        <Box
          role="list"
          sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            py: 1,
            px: 0.5,
            scrollSnapType: "x mandatory",
            "&::-webkit-scrollbar": { height: 8 },
            "&::-webkit-scrollbar-thumb": {
              background: theme.palette.action.hover,
              borderRadius: 2,
            },
          }}
        >
          {Array.from({ length: placeholderCount }).map((_, i) => (
            <Box
              role="listitem"
              key={`ph-${i}`}
              sx={{
                flex: `0 0 ${CARD_MIN_WIDTH}px`,
                minWidth: `${CARD_MIN_WIDTH}px`,
                maxWidth: `${CARD_MAX_WIDTH}px`,
                scrollSnapAlign: "start",
              }}
            >
              <Skeleton
                variant="rectangular"
                height={100}
                sx={{ borderRadius: 1 }}
              />
              <Box sx={{ mt: 1 }}>
                <Skeleton width="70%" />
                <Skeleton width="50%" />
              </Box>
            </Box>
          ))}
        </Box>
      ) : similar.length === 0 ? (
        <Typography color="text.secondary">
          No similar products found.
        </Typography>
      ) : (
        // single-row horizontal scroller of product cards
        <Box
          role="list"
          sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            py: 1,
            px: 0.5,
            scrollSnapType: "x mandatory",
            // small visual polish for scrollbar
            "&::-webkit-scrollbar": { height: 8 },
            "&::-webkit-scrollbar-thumb": {
              background: theme.palette.action.hover,
              borderRadius: 2,
            },
          }}
        >
          {similar.map((p) => (
            <Box
              role="listitem"
              key={p.id}
              sx={{
                flex: `0 0 ${CARD_MIN_WIDTH}px`,
                minWidth: `${CARD_MIN_WIDTH}px`,
                scrollSnapAlign: "start",
              }}
            >
              <ProductCard
                product={p}
                onClick={() => handleClick(p)}
                showActions={true}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default SimilarProductsList;
