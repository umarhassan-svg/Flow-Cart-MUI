// src/components/products/ProductReviews.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Rating,
  Stack,
  Typography,
  Pagination,
} from "@mui/material";
import productService, { type Review } from "../../../services/product.service";

type Props = {
  productId?: string | null;
  initialRating?: number;
};

const PAGE_SIZE = 6;

const ProductReviews: React.FC<Props> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!productId) {
      setReviews([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const resp = await productService.getReviews(
          productId,
          page,
          PAGE_SIZE
        );
        if (!mounted) return;
        setReviews(resp.data ?? []);
        setTotal(resp.total ?? 0);
      } catch (err) {
        console.error("Failed to load reviews", err);
        if (mounted) {
          setReviews([]);
          setTotal(0);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [productId, page]);

  const avgRating = React.useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((s, r) => s + (r.rating ?? 0), 0);
    return Math.round((sum / reviews.length) * 2) / 2;
  }, [reviews]);

  return (
    <Card elevation={1}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Reviews
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Rating value={avgRating} readOnly />
          <Typography variant="body2" color="text.secondary">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </Typography>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <List disablePadding>
          {loading ? (
            <Typography color="text.secondary">Loading reviews…</Typography>
          ) : reviews.length === 0 ? (
            <Typography color="text.secondary">No reviews yet</Typography>
          ) : (
            reviews.map((r) => (
              <Box key={r.id} sx={{ mb: 2 }}>
                <ListItem alignItems="flex-start" disableGutters>
                  <ListItemAvatar>
                    <Avatar>
                      {(r.user?.name ?? "U").charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Box
                        component="div"
                        sx={{ display: "flex", gap: 1, alignItems: "center" }}
                      >
                        <Typography component="div" sx={{ fontWeight: 700 }}>
                          {r.user?.name ?? "Anonymous"}
                        </Typography>
                        <Rating value={r.rating ?? 0} readOnly size="small" />
                      </Box>
                    }
                    secondary={
                      <Box component="div" sx={{ mt: 0.5 }}>
                        {r.title && (
                          <Typography component="div" sx={{ fontWeight: 700 }}>
                            {r.title}
                          </Typography>
                        )}
                        <Typography
                          component="div"
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          {r.body}
                        </Typography>
                        <Typography
                          component="div"
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 0.5, display: "block" }}
                        >
                          {new Date(r.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                    // IMPORTANT: prevent ListItemText from wrapping children in <p>
                    primaryTypographyProps={{ component: "div" }}
                    secondaryTypographyProps={{ component: "div" }}
                  />
                </ListItem>

                <Divider />
              </Box>
            ))
          )}
        </List>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Pagination
            count={Math.max(1, Math.ceil(total / PAGE_SIZE))}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductReviews;
