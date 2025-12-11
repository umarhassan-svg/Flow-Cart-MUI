import { Box, Button, Grid, Stack, Typography } from "@mui/material";

const HeroSection = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        minHeight: "90vh", // Changed to minHeight for mobile scrolling
        backgroundColor: "#F6F9FD",
        overflow: "hidden", // CRITICAL: Prevents horizontal scrollbar due to image offset
        position: "relative",
        pb: { xs: 0, md: 0 }, // Optional padding bottom
      }}
    >
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        sx={{
          height: "100%",
          width: "100%",
          // On mobile, reverse column order if you want image on top?
          // Currently: Text top, Image bottom.
        }}
      >
        {/* LEFT COLUMN: TEXT */}
        <Grid
          size={{ xs: 12, md: 6 }}
          // Takes half width on desktop, full on mobile
          sx={{
            textAlign: "left",
            paddingLeft: { xs: 3, md: 5, lg: 8 }, // Adjusted padding
            paddingRight: { xs: 3, md: 0 }, // Add right padding on mobile so text doesn't hit edge
            paddingTop: { xs: 8, md: 0 }, // Add top padding on mobile
            zIndex: 2, // Ensure text stays above background elements
          }}
        >
          <Box>
            <Typography
              variant="h1"
              component="div"
              gutterBottom
              sx={{
                fontSize: {
                  xs: "2rem", // Readable mobile size
                  sm: "2.5rem",
                  md: "3rem",
                  lg: "3.5rem",
                },
                lineHeight: { xs: 1.2, md: 1.1 },
                fontWeight: 700,
                marginBottom: { xs: 2, md: 4 },
              }}
            >
              Welcome to Flow Cart! Your one-stop shop
            </Typography>
            <Typography
              variant="body1"
              component="div"
              gutterBottom
              sx={{
                fontSize: {
                  xs: "1rem",
                  md: "1.1rem",
                },
                color: "text.secondary",
                maxWidth: { xs: "100%", md: "85%" },
                marginBottom: { xs: 4, md: 6 },
              }}
            >
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eaque,
              atque delectus nostrum laudantium excepturi quae fuga quibusdam
              voluptas debitis, neque dolorum laborum voluptate recusandae.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }} // Stack buttons vertically on very small phones
              spacing={{ xs: 2, sm: 3 }}
              sx={{
                alignItems: { xs: "stretch", sm: "flex-start" },
              }}
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{
                  padding: "12px 30px",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
              >
                Shop Now
              </Button>

              <Button
                variant="outlined"
                color="primary"
                size="large"
                sx={{
                  padding: "12px 30px",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  borderWidth: "2px",
                  "&:hover": { borderWidth: "2px" },
                }}
              >
                Learn More
              </Button>
            </Stack>
          </Box>
        </Grid>

        {/* RIGHT COLUMN: IMAGE */}
        <Grid
          size={{ xs: 12, md: 6 }} // Takes half width on desktop
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-end",
            position: "relative",
            // On mobile, give the image section a fixed height relative to viewport
            height: { xs: "50vh", md: "90vh" },
            marginTop: { xs: 4, md: 0 },
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              position: "relative",
            }}
          >
            {/* The Image Container */}
            <Box
              sx={{
                position: "absolute",
                // Responsive positioning logic
                width: { xs: "100%", md: "120%" }, // Full width on mobile, overflow on desktop
                height: { xs: "90%", md: "75%" }, // Adjust height ratio
                right: { xs: 0, md: 0 }, // Reset right position
                bottom: 0,
                // On desktop, shift right to create the cut-off effect.
                // On mobile, maybe center it or keep it right aligned?
                transform: { xs: "translateX(10%)", md: "translateX(0)" },
              }}
            >
              {/* Main Image */}
              <Box
                component="img"
                src="https://plus.unsplash.com/premium_photo-1666298863696-8e8da5d85f2b?q=80&w=870&auto=format&fit=crop"
                alt="Home Illustration"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  // The Borders
                  borderTop: "20px solid",
                  borderLeft: "20px solid",
                  borderColor: "primary.main",
                  display: "block",
                  // Rounded corner for better aesthetics (optional)
                  borderTopLeftRadius: "30px",
                }}
              />

              {/* Dark Overlay on Image */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: "black",
                  opacity: 0.2,
                  pointerEvents: "none",
                  // Match the border offset so overlay doesn't cover the blue border
                  clipPath: "inset(20px 0 0 20px)",
                  borderTopLeftRadius: "30px",
                }}
              />

              {/* Floating "Mobile App View" Card */}
              {/* <Box
                sx={{
                  position: "absolute",
                  top: { xs: "-10%", md: "-15%" }, // Move up slightly
                  left: { xs: "5%", md: "-10%" }, // Adjust horizontal position
                  width: { xs: "100px", md: "160px", lg: "200px" },
                  height: { xs: "160px", md: "240px", lg: "300px" },
                  // Styling
                  border: "4px solid",
                  borderTop: "14px solid",
                  borderBottom: "14px solid",
                  borderColor: "#333",
                  bgcolor: "#aed3df",
                  borderRadius: 3,
                  zIndex: 3,
                  boxShadow: 4, // Add shadow for depth
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  color: "#333",
                  fontWeight: "bold",
                  fontSize: { xs: "0.7rem", md: "0.9rem" },
                  px: 1,
                }}
              >
                Mobile App View
              </Box> */}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HeroSection;
