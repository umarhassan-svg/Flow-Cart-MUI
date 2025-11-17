import { Container, Typography, Box, Button } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useThemeContext } from "../../context/ThemeContext";
const Home = () => {
  const { toggleTheme } = useThemeContext();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Hero Section using Box for layout */}
      <Box
        sx={{
          py: 8, // padding top/bottom
          px: 4, // padding left/right
          textAlign: "center",
          backgroundColor: "background.paper", // Uses the theme's background color
          borderRadius: 2, // Rounded corners
          boxShadow: 3, // Slight elevation
        }}
      >
        {/* Main Title */}
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700, color: "primary.main" }}
        >
          Welcome to Our React MUI App
        </Typography>

        {/* Subtitle/Description */}
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          This is a simple, responsive Home page built with Material UI
          components for a modern look and feel.
        </Typography>

        {/* Call to Action Button */}
        <Button
          variant="contained"
          color="primary"
          size="large"
          endIcon={<ArrowForwardIcon />}
          onClick={toggleTheme}
          // You would typically link this to a route, e.g., component={Link} to="/products"
        >
          Get Started
        </Button>
      </Box>

      {/* Optionally, you could add more sections here */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h4" gutterBottom>
          Explore Features
        </Typography>
        <Typography variant="body1">
          Add additional cards, lists, or grids here to showcase different parts
          of your application.
        </Typography>
      </Box>
    </Container>
  );
};

export default Home;
