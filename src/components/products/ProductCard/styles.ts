// src/components/products/styles.ts
import { type SxProps, type Theme, styled } from "@mui/material/styles";
import Card from "@mui/material/Card";

export const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  transition: "box-shadow 180ms ease, transform 160ms ease",
  "&:hover": { boxShadow: theme.shadows[6], transform: "translateY(-4px)" },
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  cursor: "pointer",
}));

export const mediaSx: SxProps<Theme> = {
  width: "100%",
  height: 180,
  objectFit: "cover",
  display: "block",
};

export const contentSx: SxProps<Theme> = {
  flex: 1,
  px: 2,
  py: 1.5,
  display: "flex",
  flexDirection: "column",
  gap: 1,
};

export const titleSx: SxProps<Theme> = {
  fontWeight: 800,
  fontSize: { xs: "1rem", sm: "1.05rem", md: "1.08rem" },
  lineHeight: 1.1,
  mb: 0.25,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const descriptionSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: "0.82rem",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  minHeight: "2.1em",
};

export const priceRowSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  mt: 1,
};

export const priceSx: SxProps<Theme> = {
  fontWeight: 800,
  fontSize: { xs: "0.98rem", sm: "1rem" },
};

export const oldPriceSx: SxProps<Theme> = {
  textDecoration: "line-through",
  color: "text.disabled",
  fontSize: "0.88rem",
};

export const lowStockSx: SxProps<Theme> = {
  display: "block",
  mt: 0.5,
  color: "warning.main",
  fontSize: "0.72rem",
};

export const tagsSx: SxProps<Theme> = {
  display: "flex",
  gap: 0.5,
  flexWrap: "wrap",
  mt: 1,
};

export const actionsSx: SxProps<Theme> = {
  px: 2,
  py: 1.25,
  borderTop: (t) => `1px solid ${t.palette.divider}`,
  display: "flex",
  alignItems: "center",
  gap: 1,
  // ensure small screens wrap sensibly
  flexWrap: { xs: "wrap", sm: "nowrap" },
};

export const actionLeftSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
    gap: 0.75,
  
};

export const actionRightSx: SxProps<Theme> = {
  marginLeft: "auto",
  display: "flex",
  alignItems: "center",
  gap: 1,
};

export const avatarSx: SxProps<Theme> = {
  width: 36,
  height: 36,
  bgcolor: "transparent",
    color: "text.secondary",
  
  border: (t) => `1px solid ${t.palette.divider}`,
};

export const badgeSx: SxProps<Theme> = {
  position: "absolute",
  top: 20,
  right: 40,
  borderRadius: 0,
  ".MuiBadge-badge": {
    height: "auto",
    minWidth: 0,
    padding: "6px 8px",
    display: "inline-flex",
    alignItems: "center",
    gap: 0.5,
    boxShadow: (t) =>
      t.palette.mode === "light"
        ? "0 2px 8px rgba(0,0,0,0.08)"
        : "0 2px 12px rgba(0,0,0,0.4)",
  },
};

