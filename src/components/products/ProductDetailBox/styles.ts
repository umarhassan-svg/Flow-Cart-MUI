// src/components/products/ProductDetailBox/styles.ts
import { styled, type SxProps, type Theme } from "@mui/material/styles";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";

/** Central spacing token (use across left/right columns) */
const columnGap = 1; // theme.spacing(1)

/** Card wrapper */
export const RootCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  overflow: "visible",
}));

/** Main product image (keeps aspect ratio, hides until loaded) */
export const MainImage = styled("img")<{
  $loaded?: boolean;
}>(({ theme, $loaded }) => ({
  width: "100%",
  height: "auto",
  aspectRatio: "1 / 1",
  maxHeight: 400,
  objectFit: "cover",
  borderRadius: theme.shape.borderRadius,
    display: $loaded ? "block" : "none",
}));

/** Thumbnail image */
export const Thumb = styled("img")(({ theme }) => ({
  width: 76,
  height: 64,
  objectFit: "cover",
  borderRadius: 8,
  cursor: "pointer",
  border: `1px solid ${theme.palette.divider}`,
    display: "block",
}));

/** Strong price text */
export const PriceStrong = styled(Typography)(() => ({
  fontWeight: 800,
  letterSpacing: "-0.2px",
}));

/** CardContent padding */
export const cardContentSx: SxProps<Theme> = {
  p: { xs: 2, md: 3 },
};

/** Left column - consistent column layout and gap */
export const leftColSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: columnGap,
  alignItems: "stretch",
};

/** Image wrapper — consistent minHeight and padding so thumbnails align */
export const imageWrapperSx: SxProps<Theme> = {
  position: "relative",
  width: "100%",
  minHeight: { xs: 260, sm: 320, md: 380 },
  display: "block",
  overflow: "hidden",
  borderRadius: 1,
  // keep internal breathing room so arrows don't collide with edges
  px: { xs: 0, sm: 0.25 },
  pt: { xs: 0, sm: 0.25 },
};

/** Thumbnails container - consistent small gap and padding */
export const thumbnailsStackSx: SxProps<Theme> = {
  mt: 0,
  overflowX: "auto",
  pb: 0.5,
  display: "flex",
  alignItems: "center",
  gap: 1,
    padding: 0.5,
  margin:1,
};

/** Thumbnail wrapper (selected outline) */
export const thumbBoxSx = (selected: boolean,) =>
  (theme?: Theme) =>
    ({
      borderRadius: 1,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      outline: selected ? `2px solid ${theme?.palette.primary.main}` : "none",
      background: selected ? (theme?.palette.action.selected ?? "transparent") : "transparent",
    } as SxProps<Theme>);

/** Arrow buttons (prev / next) */
export const arrowBtnSx: SxProps<Theme> = (theme) => ({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  bgcolor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  width: 40,
  height: 40,
  zIndex: 3,
  "&:hover": { bgcolor: theme.palette.action.hover },
});

/** Rating + meta row */
export const metaRowSx: SxProps<Theme> = {
  display: "flex",
  gap: 1,
  alignItems: "center",
  flexWrap: "wrap",
};

/** Price area container (handles stacked / inline) */
export const priceAreaSx: SxProps<Theme> = {
  display: "flex",
  gap: 2,
  alignItems: "baseline",
  flexDirection: { xs: "column", sm: "row" },
};

/** Free shipping note */
export const shippingSx: SxProps<Theme> = {
  display: "flex",
  gap: 0.5,
  alignItems: "center",
  mt: 0.5,
};

/** Buy controls grid wrapper (applies outer spacing) */
export const buyGridContainerSx: SxProps<Theme> = {
  mt: 1,
  width: "100%",
};

/** Individual grid item sizing helpers (used as sx on Grid item) */
export const qtyGridItemSx: SxProps<Theme> = {
  width: "100%",
  maxWidth: { sm: 120 },
};

export const actionButtonSx: SxProps<Theme> = {
  width: { xs: "100%", sm: "auto" },
  whiteSpace: "nowrap",
  px: { xs: 1.5, sm: 2 },
};

/** Icons group Sx (wishlist/share) */
export const iconsGroupSx: SxProps<Theme> = {
  display: "flex",
  gap: 0.5,
  alignItems: "center",
  justifyContent: { xs: "flex-start", sm: "flex-end" },
  width: "100%",
};

/** Tags row */
export const tagsRowSx: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1,
  mt: 1,
};

/** Details block */
export const detailsSx: SxProps<Theme> = {
  mt: 1,
  color: "text.secondary",
  whiteSpace: "pre-wrap",
};

/** Title — slightly reduced but bold and main */
export const titleSx: SxProps<Theme> = {
  fontWeight: 800,
  fontSize: { xs: "2.25rem", sm: "2.35rem", md: "2.45rem" },
  lineHeight: 1.15,
  mb: 0, // spacing handled by column gap
};

export default {
  RootCard,
  MainImage,
  Thumb,
  PriceStrong,
  cardContentSx,
  leftColSx,
  imageWrapperSx,
  thumbnailsStackSx,
  thumbBoxSx,
  arrowBtnSx,
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
};
