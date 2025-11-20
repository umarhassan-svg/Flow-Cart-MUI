// src/components/dashboard/MetricCard.tsx
import { Card, CardContent, Typography, Box, Divider } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

interface MetricCardProps {
  title: string;
  value: string;
  change: number; // e.g., 5.2 for 5.2%
  timeframe: string;
}

const MetricCard = ({ title, value, change, timeframe }: MetricCardProps) => {
  const isPositive = change >= 0;
  const changeColor = isPositive ? "success.main" : "error.main";
  const ChangeIcon = isPositive ? ArrowUpwardIcon : ArrowDownwardIcon;

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 2,
        padding: 2,
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        boder: 1,
      }}
    >
      <CardContent>
        <Typography color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography
          variant="h4"
          component="div"
          sx={{ fontWeight: 700, mb: 1 }}
        >
          {value}
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
          <ChangeIcon
            sx={{ color: changeColor, mr: 0.5, fontSize: "1.2rem" }}
          />
          <Typography
            variant="body2"
            sx={{ color: changeColor, fontWeight: 600 }}
          >
            {Math.abs(change).toFixed(1)}%
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            {timeframe}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
