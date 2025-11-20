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
  TextField,
  InputAdornment,
  IconButton, // Import IconButton
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import productsService from "../services/product.service";
import type { Product } from "../types/Product";
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
import { useAuth } from "../context/AuthContext";

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

type ProductQuery = {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
};

const ProductsListPage = () => {
  const [banners] = useState<Banner[]>(sampleBanners);

  const [featured, setFeatured] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false); // New state for toggling search bar

  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [featuredLoading, setFeaturedLoading] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters | undefined>(undefined);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { can } = useAuth();

  // Debounce Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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
          search: debouncedSearch,
          category: filters?.category ?? undefined,
          tags: filters?.tags,
          minPrice: filters?.minPrice,
          maxPrice: filters?.maxPrice,
          minRating: filters?.minRating,
        } as ProductQuery;

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
    [page, limit, filters, debouncedSearch]
  );

  useEffect(() => {
    loadFeatured();
  }, [loadFeatured]);

  useEffect(() => {
    loadProducts(page === 1);
  }, [page, filters, debouncedSearch, loadProducts]);

  const handleOpenFilter = () => setFilterOpen(true);

  const handleApplyFilter = (f: Filters) => {
    setFilters(f);
    setPage(1);
    setFilterOpen(false);
  };

  const handleClearFilter = () => {
    setFilters(undefined);
    setSearchTerm("");
    setPage(1);
  };

  const handleAddToCart = (p: Product) => {
    addToCart(p);
  };

  const canLoadMore = products.length < total;

  const handleOpenProductDetail = (p: Product) => {
    navigate(`/products/${p.id}`);
  };

  const handleBulkOrder = () => {
    navigate("/bulk-order");
  };

  // Check if user is actively searching (either typing or debounced search is applied)
  const isSearching = searchTerm.length > 0 || debouncedSearch.length > 0;

  const handleToggleSearch = () => {
    // If we are closing the search bar, clear the search term
    if (isSearchOpen) {
      setSearchTerm("");
    }
    setIsSearchOpen((prev) => !prev);
  };

  return (
    <LayoutMain>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* New Stack for Title + Search Icon */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ mb: 3 }}
        >
          {/* Title and Subtitle Section (left aligned) */}
          <Box>
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{
                fontSize: {
                  xs: "1.25rem", // extra-small screens (mobile)
                  sm: "1.5rem", // small screens
                  md: "1.75rem", // medium screens
                  lg: "2rem", // large screens
                },
              }}
            >
              Our Products
            </Typography>

            <Typography variant="body1" color="text.secondary">
              Let's start shopping
            </Typography>
          </Box>

          {/* Search Toggle Icon (right aligned) */}
          <IconButton
            onClick={handleToggleSearch}
            color={isSearchOpen ? "primary" : "default"}
            size="large"
          >
            <SearchIcon />
          </IconButton>
        </Stack>

        {/* Search Bar on Top (Conditional Rendering) */}
        {isSearchOpen && (
          <Box sx={{ mb: 4, maxWidth: "100%" }}>
            <TextField
              // fullWidth remains true to fill the container width
              fullWidth
              placeholder="Search for products, categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus // Focus the field when it appears
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        )}

        {/* Conditionally Render Banners & Featured: Hide if searching */}
        {!isSearching && (
          <>
            {/* Banners */}
            <BannerSlider banners={banners} height={260} />

            {/* Featured Section */}
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
                {/* Bulk Order Button // can("cart:bulk-order") */}
                {can("cart:update") && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleBulkOrder}
                  >
                    Bulk Order
                  </Button>
                )}
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
          </>
        )}

        {/* Main Product List (Always visible, shows search results) */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {isSearching
              ? `Search Results for "${debouncedSearch}"`
              : "All products"}
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
          {/* Show 'No results' message if search yields nothing */}
          {!loading && products.length === 0 && (
            <Box textAlign="center" py={5}>
              <Typography variant="body1" color="text.secondary">
                {isSearching
                  ? `No products found matching "${debouncedSearch}".`
                  : "No products available."}
              </Typography>
            </Box>
          )}

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
          ) : products.length > 0 ? (
            <Typography color="text.secondary">No more products</Typography>
          ) : null}
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
