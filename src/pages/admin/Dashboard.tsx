import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";

// Icons
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PeopleIcon from "@mui/icons-material/People";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

// MUI X Charts
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";
import StatCard from "../../components/DashBoard/StatCard/StatCard";
import LayoutMain from "../../components/layout/layoutMain";

// --- Mock Data ---

const statCards = [
  {
    title: "Total Sales",
    value: "$124,500",
    icon: <AttachMoneyIcon />,
    color: "#1976d2",
    trend: "+14%",
  },
  {
    title: "New Users",
    value: "1,240",
    icon: <PeopleIcon />,
    color: "#2e7d32",
    trend: "+5%",
  },
  {
    title: "Orders",
    value: "450",
    icon: <ShoppingCartIcon />,
    color: "#ed6c02",
    trend: "-2%",
  },
  {
    title: "Growth",
    value: "24.5%",
    icon: <TrendingUpIcon />,
    color: "#9c27b0",
    trend: "+8%",
  },
];

const productData = [
  {
    id: 1,
    name: "Wireless Headphones",
    category: "Electronics",
    sales: 320,
    status: "In Stock",
  },
  {
    id: 2,
    name: "Ergonomic Chair",
    category: "Furniture",
    sales: 210,
    status: "Low Stock",
  },
  {
    id: 3,
    name: "Mechanical Keyboard",
    category: "Electronics",
    sales: 150,
    status: "In Stock",
  },
  {
    id: 4,
    name: "Smart Watch Gen 5",
    category: "Wearables",
    sales: 110,
    status: "Out of Stock",
  },
  {
    id: 5,
    name: "Gaming Mouse",
    category: "Electronics",
    sales: 95,
    status: "In Stock",
  },
];

export const AdminDashboard = () => {
  return (
    <>
      <LayoutMain>
        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: "background.default",
            minHeight: "100vh",
          }}
        >
          <Grid container spacing={3}>
            {/* 1. HEADER */}
            <Grid size={{ xs: 12 }}>
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
                DashBoard Overview
              </Typography>
            </Grid>

            {/* 2. TOP CARDS ROW */}
            {statCards.map((card, index) => (
              <Grid size={{ xs: 12, md: 3, lg: 3 }} key={index}>
                <StatCard {...card} />
              </Grid>
            ))}

            {/* 3. CHARTS ROW */}

            {/* Line Chart: Revenue/Trends */}
            <Grid size={{ xs: 12, md: 8, sm: 12 }}>
              <Card
                elevation={3}
                sx={{ p: 2, borderRadius: 3, height: "100%" }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Revenue Analytics
                </Typography>
                <Box sx={{ width: "100%", height: 350 }}>
                  <LineChart
                    xAxis={[
                      { data: [1, 2, 3, 4, 5, 6], label: "Months (Jan-Jun)" },
                    ]}
                    series={[
                      {
                        data: [2400, 1398, 9800, 3908, 4800, 7800],
                        label: "Revenue ($)",
                        area: true, // Makes it an Area chart look
                        color: "#1976d2",
                        showMark: false,
                      },
                      {
                        data: [4000, 3000, 2000, 2780, 1890, 2390],
                        label: "Expenses ($)",
                        color: "#ff5252",
                        showMark: false,
                      },
                    ]}
                    grid={{ vertical: true, horizontal: true }}
                  />
                </Box>
              </Card>
            </Grid>

            {/* Pie Chart: Category Distribution */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                elevation={3}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  height: "100%",
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Sales by Category
                </Typography>
                <Box
                  sx={{
                    width: "100%",
                    height: 300,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <PieChart
                    series={[
                      {
                        data: [
                          {
                            id: 0,
                            value: 45,
                            label: "Electronics",
                            color: "#1976d2",
                          },
                          {
                            id: 1,
                            value: 25,
                            label: "Furniture",
                            color: "#2e7d32",
                          },
                          {
                            id: 2,
                            value: 20,
                            label: "Wearables",
                            color: "#ed6c02",
                          },
                          {
                            id: 3,
                            value: 10,
                            label: "Others",
                            color: "#9c27b0",
                          },
                        ],
                        innerRadius: 40, // Donut chart style
                        paddingAngle: 2,
                        cornerRadius: 4,
                        highlightScope: {
                          fade: "global",
                          highlight: "item",
                        },
                        faded: {
                          innerRadius: 30,
                          additionalRadius: -30,
                          color: "gray",
                        },
                      },
                    ]}
                    slotProps={{
                      legend: {
                        direction: "horizontal",
                        position: { vertical: "bottom", horizontal: "center" },
                      },
                    }}
                    margin={{ top: 0, bottom: 40, left: 0, right: 0 }}
                  />
                </Box>
              </Card>
            </Grid>

            {/* 4. TABLE SECTION */}
            <Grid size={{ xs: 12 }}>
              <Card elevation={3} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Most Demanding Products
                  </Typography>
                  <TableContainer>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                      <TableHead>
                        <TableRow
                          sx={{ backgroundColor: "background.default" }}
                        >
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Product Name
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Category
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }} align="right">
                            Units Sold
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Status
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {productData.map((row) => (
                          <TableRow
                            key={row.id}
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                              "&:hover": {
                                backgroundColor: "primary.contrastText",
                              },
                            }}
                          >
                            <TableCell
                              component="th"
                              scope="row"
                              sx={{ fontWeight: 500 }}
                            >
                              {row.name}
                            </TableCell>
                            <TableCell>{row.category}</TableCell>
                            <TableCell align="right">{row.sales}</TableCell>
                            <TableCell>
                              <Chip
                                label={row.status}
                                size="small"
                                color={
                                  row.status === "In Stock"
                                    ? "success"
                                    : row.status === "Low Stock"
                                    ? "warning"
                                    : "error"
                                }
                                variant="outlined"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </LayoutMain>
    </>
  );
};
