// src/pages/ProductDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Breadcrumbs,
  Link,
  Typography,
  CircularProgress,
  Divider,
} from "@mui/material";
import productService from "../services/product.service";
import type { Product } from "../types/Product";
import ProductDetailBox from "../components/products/ProductDetailBox/ProductsDetailBox";
import ProductReviews from "../components/products/ProductReviews/ProductReviews";
import SimilarProductsList from "../components/products/SimilarProductsList/SimilarProductsList";
import LayoutMain from "../components/layout/layoutMain";
import { useCart } from "../context/CartContext";

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        if (!id) throw new Error("Missing product id");
        const p = await productService.get(id);
        if (!mounted) return;
        setProduct(p as Product);
      } catch (err: unknown) {
        console.error(err);
        setError((err as Error)?.message ?? "Failed to load product");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Container sx={{ py: 6 }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container sx={{ py: 6 }}>
        <Typography color="error">{error || "Product not found"}</Typography>
      </Container>
    );
  }

  function handleAddtoCart(product: Product, qty?: number | undefined): void {
    addToCart(product, qty);
  }

  function handleBuyNow(product: Product, qty?: number | undefined): void {
    addToCart(product, qty);
    navigate("/checkout");
  }

  return (
    <LayoutMain>
      <Container sx={{ py: { xs: 3, md: 6 } }}>
        {/* Breadcrumb / route line */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link
            component={RouterLink}
            to="/products"
            underline="hover"
            color="inherit"
          >
            Products
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 600 }}>
            {product.title}
          </Typography>
        </Breadcrumbs>

        <Grid container spacing={4} direction={"column"}>
          <Grid size={{ xs: 12 }}>
            <ProductDetailBox
              product={product}
              onAddToCart={handleAddtoCart}
              onBuyNow={handleBuyNow}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ProductReviews
              productId={product.id}
              initialRating={product.rating ?? 0}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              You may also like
            </Typography>
            <SimilarProductsList product={product} />
          </Grid>
        </Grid>
      </Container>
    </LayoutMain>
  );
};

export default ProductDetailPage;
