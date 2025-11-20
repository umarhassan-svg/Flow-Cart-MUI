// src/components/products/ProductsGrid.tsx
import React from "react";
import { Grid, Box, CircularProgress } from "@mui/material";
import ProductCard from "../ProductCard/Productcard";
import type { Product } from "../../../types/Product";

type Props = {
  products: Product[];
  loading?: boolean;
  onAddToCart?: (p: Product) => void;
  onOpen: (p: Product) => void;
};

const ProductsGrid = ({
  products,
  loading = false,
  onAddToCart,
  onOpen,
}: Props) => {
  return (
    <>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <Grid container spacing={3}>
            {products.map((p) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={p.id}>
                <ProductCard
                  product={p}
                  onAddToCart={onAddToCart}
                  onClick={onOpen}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </>
  );
};

export default ProductsGrid;
