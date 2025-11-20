import { Box, Card, CardContent, Typography } from "@mui/material";

const ChartCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => {
  return (
    <>
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Typography color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div" color="grey.600">
            {subtitle}
          </Typography>
          <Box sx={{ mt: 2 }} display="flex" alignItems="center">
            {children}
          </Box>
        </CardContent>
      </Card>
    </>
  );
};
export default ChartCard;
