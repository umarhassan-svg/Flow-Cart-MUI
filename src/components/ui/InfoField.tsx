import { Box, Typography } from "@mui/material";

// Renders the "Label" on top and "Value" below it
const InfoField = ({ label, value }: { label: string; value: string }) => (
  <Box>
    <Typography
      variant="caption"
      sx={{
        color: "text.primary",
        display: "block",
        mb: 0.5,
        fontWeight: 500,
        fontSize: "0.85rem",
      }}
    >
      {label}
    </Typography>
    <Typography
      variant="body1"
      sx={{
        color: "text.secondary",
        fontWeight: 600,
        fontSize: "1rem",
      }}
    >
      {value || "-"}
    </Typography>
  </Box>
);

export default InfoField;
