import React, { useState, useMemo, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  useTheme,
  Paper,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemove";

// Imports from your project structure
import { useParseCSV } from "../hooks/useParseCSV";
import CartItemCard from "../components/ui/CartItemCard";
import productsService from "../services/product.service";
import type { CartItem } from "../types/cart";
import LayoutMain from "../components/layout/layoutMain";
import { useCart } from "../context/CartContext";
import CustomDialogbox from "../components/ui/CustomDialogbox";

// --- HELPER: DOWNLOAD TEMPLATE ---
const downloadTemplate = () => {
  const csvContent =
    "data:text/csv;charset=utf-8,productId,quantity\np1,5\np2,2";
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "bulk_order_template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const BulkOrderPage = () => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Integration of your hook
  const { parseFile, loading: parsing, error, reset } = useParseCSV();

  // Local loading state for the Database lookup part
  const [processing, setProcessing] = useState(false);
  const { addToCart } = useCart();

  // Local state for the mapped cart items
  const [bulkItems, setBulkItems] = useState<CartItem[]>([]);
  const [parseReport, setParseReport] = useState<{
    success: number;
    failed: number;
  } | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  // --- HANDLERS ---

  const isValidInput = (pid: string, qtyRaw: string): boolean => {
    if (!pid) return false;
    if (!qtyRaw) return false;
    const qty = Number(qtyRaw);
    if (isNaN(qty) || qty < 1 || !Number.isInteger(qty)) {
      return false;
    }
    return true;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkItems([]);
    setParseReport(null);

    const result = await parseFile(file);

    if (!result || !result.rows || result.rows.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setProcessing(true);

    try {
      const promises = result.rows.map(async (row) => {
        const pid =
          row["productId"] || row["product_id"] || row["sku"] || row["id"];
        const qtyRaw = row["quantity"] || row["qty"] || row["count"];

        if (!isValidInput(pid, qtyRaw)) {
          return null;
        }

        try {
          const product = await productsService.get(pid);
          const quantity = parseInt(qtyRaw, 10);

          if (product && !isNaN(quantity) && quantity > 0) {
            return {
              id: product.id,
              product: product,
              qty: quantity,
            } as CartItem;
          }
        } catch (err) {
          console.error(`Failed to fetch product ${pid}`, err);
          return null;
        }
        return null;
      });

      const results = await Promise.all(promises);

      const validItems = results.filter(
        (item): item is CartItem => item !== null
      );
      const failedCount = result.rows.length - validItems.length;

      setBulkItems(validItems);
      setParseReport({ success: validItems.length, failed: failedCount });
    } catch (err) {
      console.error("Bulk processing error", err);
    } finally {
      setProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUpdateQty = (id: string, qty: number) => {
    setBulkItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty } : item))
    );
  };

  const handleRemove = (id: string) => {
    setBulkItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    setBulkItems([]);
    setParseReport(null);
    reset();
  };

  // --- CALCULATIONS ---

  const totalAmount = useMemo(() => {
    return bulkItems.reduce((sum, item) => {
      const price = item.product.discountPrice ?? item.product.price;
      return sum + price * item.qty;
    }, 0);
  }, [bulkItems]);

  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalAmount);

  const isLoading = parsing || processing;

  function handleAddToCart(event: React.FormEvent): void {
    event.preventDefault();
    bulkItems.forEach((item) => {
      addToCart(item.product, item.qty);
    });
    handleClearAll();
    setDialogMessage("Items added to cart");
    setOpenDialog(true);
  }

  // --- RENDER ---

  return (
    <>
      <LayoutMain>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box mb={4}>
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
              Bulk Order Upload
            </Typography>

            <Typography variant="body1" color="text.secondary">
              Upload a CSV file to populate your cart instantly.
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {/* --- LEFT COLUMN (Fixed Width) --- */}
            <Grid size={{ xs: 12, md: 4, lg: 5 }}>
              <Stack spacing={3}>
                {/* 1. UPLOAD AREA */}
                <Paper
                  elevation={0}
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderStyle: "dashed",
                    borderWidth: 2,
                    borderColor: isLoading
                      ? theme.palette.primary.main
                      : theme.palette.divider,
                    backgroundColor: isLoading
                      ? theme.palette.action.hover
                      : "transparent",
                    textAlign: "center",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <input
                    type="file"
                    accept=".csv"
                    hidden
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />

                  {isLoading ? (
                    <Stack alignItems="center" spacing={2} py={2}>
                      <CircularProgress size={30} />
                      <Typography variant="body2">Processing...</Typography>
                    </Stack>
                  ) : (
                    <Stack alignItems="center" spacing={2}>
                      <CloudUploadIcon
                        sx={{ fontSize: 40, color: "text.secondary" }}
                      />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Click to Upload
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          .CSV (productId, quantity)
                        </Typography>
                      </Box>
                      <Stack direction="column" spacing={1} width="100%">
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Select File
                        </Button>
                        <Button
                          fullWidth
                          variant="text"
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={downloadTemplate}
                        >
                          Download Template
                        </Button>
                      </Stack>
                    </Stack>
                  )}
                </Paper>

                {/* 2. ALERTS */}
                {error && (
                  <Alert severity="error" onClose={reset}>
                    {error}
                  </Alert>
                )}

                {parseReport && (
                  <Alert
                    severity={parseReport.success > 0 ? "success" : "warning"}
                  >
                    {parseReport.success} items loaded.
                    {parseReport.failed > 0 && ` ${parseReport.failed} failed.`}
                  </Alert>
                )}

                {/* 3. ORDER SUMMARY (Moved to Left Bottom) */}
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Summary
                    </Typography>
                    <Divider sx={{ my: 2 }} />

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      mb={1}
                    >
                      <Typography color="text.secondary">Items:</Typography>
                      <Typography fontWeight="bold">
                        {bulkItems.reduce((acc, i) => acc + i.qty, 0)}
                      </Typography>
                    </Stack>

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      mb={3}
                    >
                      <Typography color="text.secondary">Total:</Typography>
                      <Typography
                        variant="h6"
                        color="primary.main"
                        fontWeight="bold"
                      >
                        {formattedTotal}
                      </Typography>
                    </Stack>

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<ShoppingCartCheckoutIcon />}
                      disabled={bulkItems.length === 0}
                      onClick={handleAddToCart}
                    >
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>

            {/* --- RIGHT COLUMN (Scrollable List) --- */}
            <Grid size={{ xs: 12, md: 8, lg: 7 }}>
              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Header of List */}
                <Box
                  sx={{
                    p: 2,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Parsed Product List
                  </Typography>
                  {bulkItems.length > 0 && (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<RestartAltIcon />}
                      onClick={handleClearAll}
                    >
                      Clear All
                    </Button>
                  )}
                </Box>

                {/* Scrollable Content Area */}
                <CardContent
                  sx={{
                    flexGrow: 1,
                    // Calculates height to fit screen, minus header/padding
                    maxHeight: "calc(100vh - 200px)",
                    minHeight: "400px",
                    overflowY: "auto",

                    // Custom Scrollbar Styling
                    "&::-webkit-scrollbar": {
                      width: "8px",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: theme.palette.grey[100],
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: theme.palette.grey[400],
                      borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                      background: theme.palette.grey[600],
                    },
                  }}
                >
                  {bulkItems.length === 0 ? (
                    <Stack
                      alignItems="center"
                      justifyContent="center"
                      sx={{ height: "100%", minHeight: 300, opacity: 0.5 }}
                      spacing={2}
                    >
                      <PlaylistRemoveIcon sx={{ fontSize: 60 }} />
                      <Typography variant="h6">No items to display</Typography>
                      <Typography variant="body2">
                        Upload a CSV file on the left to begin
                      </Typography>
                    </Stack>
                  ) : (
                    <Stack spacing={2}>
                      {bulkItems.map((item) => (
                        <React.Fragment key={item.id}>
                          <CartItemCard
                            item={item}
                            onIncrement={(id) =>
                              handleUpdateQty(id, item.qty + 1)
                            }
                            onDecrement={(id) =>
                              handleUpdateQty(id, item.qty - 1)
                            }
                            onSetQty={(id, qty) => handleUpdateQty(id, qty)}
                            onRemove={handleRemove}
                          />
                          <Divider />
                        </React.Fragment>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          {openDialog && (
            <CustomDialogbox
              title="Bulk Order Message"
              open={openDialog}
              onClose={() => setOpenDialog(false)}
              message={dialogMessage}
            />
          )}
        </Container>
      </LayoutMain>
    </>
  );
};

export default BulkOrderPage;
