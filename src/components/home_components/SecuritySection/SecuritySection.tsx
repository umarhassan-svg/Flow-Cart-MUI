import { Box, Grid, Typography, Button, Stack } from "@mui/material";

const SecuritySection = () => {
  return (
    <Box sx={{ flexGrow: 1, padding: { xs: 4, md: 10 }, bgcolor: "#fff" }}>
      <Grid container spacing={6} alignItems="center">
        {/* Left Column: Text Content */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ maxWidth: 500 }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 800,
                color: "#021545",
                marginBottom: 3,
                fontSize: { xs: "1.5rem", md: "2rem" },
              }}
            >
              At FlowCart We Provide TopNotch Products direct to your doorstep
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "#555",
                fontSize: "1.1rem",
                lineHeight: 1.6,
                marginBottom: 4,
              }}
            >
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta
              quam aut quaerat ipsum molestiae reiciendis, sint quos magnam vel
              cupiditate molestias libero, enim necessitatibus. Officiis nisi
              molestias eveniet excepturi exercitationem.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {/* Button 1: Filled Blue (Previously Orange) */}
              <Button
                variant="contained"
                disableElevation
                sx={{
                  borderRadius: "50px",
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  padding: "12px 30px",
                  backgroundColor: "#2196f3", // Blue instead of Orange
                  "&:hover": { backgroundColor: "#1976d2" },
                }}
                endIcon={<span>→</span>}
              >
                Get FlowCart for iPhone
              </Button>

              {/* Button 2: Outlined */}
              <Button
                variant="outlined"
                sx={{
                  borderRadius: "50px",
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  padding: "12px 30px",
                  borderColor: "#021545",
                  color: "#021545",
                  "&:hover": {
                    borderColor: "#021545",
                    backgroundColor: "rgba(2, 21, 69, 0.05)",
                  },
                }}
              >
                Get FlowCart for Android
              </Button>
            </Stack>
          </Box>
        </Grid>

        {/* Right Column: Image with Blue Background */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {/* The Blue Background Square (Previously Orange) */}
            <Box
              sx={{
                position: "absolute",
                top: 20,
                right: { xs: 0, md: 20 },
                width: "80%",
                height: "100%",
                backgroundColor: "#ffc107", // Fallback
                bgcolor: "#2196f3", // Blue instead of Orange
                borderRadius: 2,
                zIndex: 0,
              }}
            />

            {/* The Image */}
            <Box
              component="img"
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Woman using phone"
              sx={{
                position: "relative",
                zIndex: 1,
                width: "85%",
                borderRadius: 2,
                boxShadow: 3,
                // Moves image slightly left and up to reveal blue background
                transform: "translate(-10px, -10px)",
              }}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SecuritySection;
