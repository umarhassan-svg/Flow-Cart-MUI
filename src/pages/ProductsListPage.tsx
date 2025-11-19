// src/pages/ProductsPage.tsx
import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import productsService, { type Product } from "../services/product.service";
import BannerSlider, {
  type Banner,
} from "../components/products/BannerSlider/BannerSlider";
import ProductsGrid from "../components/products/ProductGrid/ProductGrid";
import FilterDialog, {
  type Filters,
} from "../components/products/FilterDialog/FilterDialog";
import LayoutMain from "../components/layout/layoutMain";
import { useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";

const sampleBanners: Banner[] = [
  {
    id: "b1",
    image: "/images/banner-sale-1.jpg",
    title: "Autumn Sale — Up to 40% off",
    subtitle: "Selected items only",
    ctaText: "Shop Sale",
    ctaUrl: "/sale",
  },
  {
    id: "b2",
    image: "/images/banner-free-shipping.jpg",
    title: "Free shipping over $50",
    subtitle: "Limited time",
    ctaText: "Explore",
    ctaUrl: "/shipping",
  },
];

const ProductsListPage: React.FC = () => {
  const [banners] = useState<Banner[]>(sampleBanners);

  const [featured, setFeatured] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [featuredLoading, setFeaturedLoading] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters | undefined>(undefined);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const loadFeatured = useCallback(async () => {
    setFeaturedLoading(true);
    try {
      const res = await productsService.featured(6);
      setFeatured(res.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setFeaturedLoading(false);
    }
  }, []);

  const loadProducts = useCallback(
    async (reset = false) => {
      setLoading(true);
      try {
        const q = {
          page,
          limit,
          category: filters?.category ?? undefined,
          tags: filters?.tags,
          minPrice: filters?.minPrice,
          maxPrice: filters?.maxPrice,
          minRating: filters?.minRating,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
        const res = await productsService.list(q);
        setTotal(res.total);
        if (reset) setProducts(res.data);
        else
          setProducts((prev) =>
            page === 1 ? res.data : [...prev, ...res.data]
          );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [page, limit, filters]
  );

  useEffect(() => {
    loadFeatured();
  }, [loadFeatured]);

  // reload when filters or page changes
  useEffect(() => {
    loadProducts(page === 1);
  }, [page, filters, loadProducts]);

  const handleOpenFilter = () => setFilterOpen(true);
  const handleApplyFilter = (f: Filters) => {
    setFilters(f);
    setPage(1);
    setFilterOpen(false);
  };

  const handleClearFilter = () => {
    setFilters(undefined);
    setPage(1);
  };

  const handleAddToCart = (p: Product) => {
    // wire to cart context / store
    console.log("add to cart", p);
    addToCart(p);
  };

  const canLoadMore = products.length < total;

  const handleOpenProductDetail = (p: Product) => {
    console.log("open product detail", p);
    navigate(`/products/${p.id}`);
  };
  return (
    <LayoutMain>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* banners */}
        <BannerSlider banners={banners} height={260} />

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mt: 3, mb: 2 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Featured products
          </Typography>

          <Stack direction="row" spacing={1}>
            <Button variant="text" size="small" onClick={loadFeatured}>
              Refresh
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ mb: 4 }}>
          {featuredLoading ? (
            <CircularProgress />
          ) : (
            <ProductsGrid
              products={featured}
              onAddToCart={handleAddToCart}
              onOpen={handleOpenProductDetail}
            />
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            All products
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              size="small"
              startIcon={<FilterListIcon />}
              onClick={handleOpenFilter}
            >
              Filters
            </Button>
            <Button variant="text" size="small" onClick={handleClearFilter}>
              Clear
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ mb: 4 }}>
          <ProductsGrid
            products={products}
            loading={loading}
            onAddToCart={handleAddToCart}
            onOpen={handleOpenProductDetail}
          />
        </Box>

        <Box textAlign="center" sx={{ mt: 2 }}>
          {loading ? (
            <CircularProgress />
          ) : canLoadMore ? (
            <Button variant="contained" onClick={() => setPage((p) => p + 1)}>
              Load more
            </Button>
          ) : (
            <Typography color="text.secondary">No more products</Typography>
          )}
        </Box>

        <FilterDialog
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          onApply={handleApplyFilter}
          categories={["all", "electronics", "home", "clothing"]}
          tagOptions={["new", "bestseller", "limited", "sale"]}
        />
      </Container>
    </LayoutMain>
  );
};

export default ProductsListPage;
