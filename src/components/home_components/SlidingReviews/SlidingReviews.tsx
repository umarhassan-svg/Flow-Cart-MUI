import { Box, Stack, Typography } from "@mui/material";
import InfiniteReviewCarousel from "./ContinuousReviewTicker/ContinuousReviewTicker"; // Ensure path is correct

const SlidingReviews = () => {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "80vh", // Use minHeight to allow growth
        backgroundColor: "primary.main",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        py: { xs: 6, md: 0 }, // Vertical padding on mobile
      }}
    >
      <Stack direction="column" spacing={2} sx={{ width: "100%" }}>
        {/* Title Section */}
        <Box
          sx={{
            px: { xs: 3, md: 10 }, // Responsive horizontal padding
            width: { xs: "100%", md: "60%" },
            boxSizing: "border-box",
          }}
        >
          <Typography
            variant="h2"
            color="white"
            align="left"
            sx={{
              fontSize: { xs: "1.8rem", md: "2.5rem" }, // Smaller font on mobile
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            Loved By Thousands of Users from across the Globe
          </Typography>
        </Box>

        {/* Carousel Section */}
        <Box sx={{ width: "100%", mt: 4, mb: 2 }}>
          <InfiniteReviewCarousel />
        </Box>

        {/* Partners Section */}
        <Box sx={{ px: { xs: 3, md: 10 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }} // Stack vertically on mobile, row on desktop
            spacing={{ xs: 3, md: 8 }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            sx={{
              mt: 2,
              flexWrap: "wrap",
            }}
          >
            <Typography
              variant="h5"
              color="white" // Changed to white for visibility on primary.main
              align="left"
              sx={{ fontWeight: "bold", mb: { xs: 1, sm: 0 } }}
            >
              Our Partners:
            </Typography>

            {/* Logos Container */}
            <Stack
              direction="row"
              spacing={4}
              alignItems="center"
              flexWrap="wrap"
            >
              {/* Google Logo */}
              <Box
                component="img"
                src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
                alt="Google"
                sx={{
                  width: { xs: 80, md: 100 }, // Smaller on mobile
                  height: "auto",
                  objectFit: "contain",
                  // Makes logo WHITE to see against primary color.
                  // Remove 'invert(1)' if you want black logos.
                  filter: "brightness(0) invert(1)",
                }}
              />

              {/* Amazon Logo */}
              <Box
                component="img"
                src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
                alt="Amazon"
                sx={{
                  width: { xs: 80, md: 100 },
                  height: "auto",
                  objectFit: "contain",
                  filter: "brightness(0) invert(1)",
                }}
              />

              {/* Microsoft Logo */}
              <Box
                component="img"
                src="https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg"
                alt="Microsoft"
                sx={{
                  width: { xs: 80, md: 100 },
                  height: "auto",
                  objectFit: "contain",
                  filter: "brightness(0) invert(1)",
                }}
              />
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default SlidingReviews;
