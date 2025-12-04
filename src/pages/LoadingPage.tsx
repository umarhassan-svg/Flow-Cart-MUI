import { CircularProgress, Paper, Typography, Box } from "@mui/material";

const Loader = () => {
  return (
    <Box
      sx={{
        height: "100vh", // full viewport height
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "background.default",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          borderRadius: 3,
        }}
      >
        <CircularProgress size={60} thickness={5} color="primary" />
        <Typography variant="h6" sx={{ mt: 1 }}>
          Loading, please wait...
        </Typography>
      </Paper>
    </Box>
  );
};

export default Loader;
