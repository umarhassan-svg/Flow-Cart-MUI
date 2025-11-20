// --- Components ---
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Avatar,
} from "@mui/material";

const StatCard = ({
  title,
  value,
  icon,
  color,
  trend,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend: string;
}) => (
  <Card
    elevation={4}
    sx={{
      height: "100%",
      borderRadius: 3,
    }}
  >
    <CardContent>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {value}
          </Typography>
        </Stack>
        <Avatar
          sx={{ bgcolor: `${color}20`, color: color, width: 48, height: 48 }}
          variant="rounded"
        >
          {icon}
        </Avatar>
      </Stack>
      <Typography
        variant="caption"
        color={trend.includes("+") ? "success.main" : "error.main"}
        sx={{
          display: "flex",
          alignItems: "center",
          mt: 2,
          fontWeight: "bold",
        }}
      >
        {trend}{" "}
        <Box
          component="span"
          color="text.secondary"
          sx={{ ml: 0.5, fontWeight: 400 }}
        >
          vs last month
        </Box>
      </Typography>
    </CardContent>
  </Card>
);

export default StatCard;
