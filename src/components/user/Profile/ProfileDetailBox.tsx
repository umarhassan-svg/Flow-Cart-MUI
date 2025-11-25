import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email"; // Make sure to install @mui/icons-material
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { useAuth } from "../../../context/AuthContext";

const ProfileDetailBox = () => {
  const { user } = useAuth();
  return (
    <Container
      maxWidth="md" // Limits width for a cleaner look
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh", // Centers vertical on full screen
        py: 4,
      }}
    >
      {/* MAIN CARD */}
      <Paper
        elevation={3} // Adds a nice shadow depth
        sx={{
          display: "flex",
          // Mobile: Column (Image top), Desktop: Row (Image Right)
          flexDirection: { xs: "column-reverse", md: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "background.paper",
          borderRadius: 3,
          width: "100%",
          gap: 4, // Spacing between text and image
        }}
      >
        {/* LEFT SIDE: Details */}
        <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            gutterBottom
          >
            {user?.name}
          </Typography>

          <Typography
            variant="h6"
            color="primary.main"
            gutterBottom
            sx={{ fontWeight: "medium" }}
          >
            {user?.email}
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Passionate developer with 8+ years of experience building scalable
            web applications. Specializing in React, Node.js, and cloud
            architecture. Always eager to solve complex problems and mentor
            junior developers.
          </Typography>

          {/* Skills Chips */}
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            justifyContent={{ xs: "center", md: "flex-start" }}
            useFlexGap
            sx={{ mb: 4 }}
          >
            {user?.allowedPages !== undefined &&
              user?.allowedPages.map((page) => (
                <Chip
                  key={page.key}
                  label={page.label}
                  color="primary"
                  size="small"
                />
              ))}
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {/* Action Buttons */}
          <Stack
            direction="row"
            spacing={2}
            justifyContent={{ xs: "center", md: "flex-start" }}
          >
            <Button variant="contained" startIcon={<EmailIcon />}>
              Contact Me
            </Button>
            <Button variant="outlined" startIcon={<LinkedInIcon />}>
              LinkedIn
            </Button>
          </Stack>
        </Box>

        {/* RIGHT SIDE: Profile Picture */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Avatar
            alt="Profile Picture"
            src={user?.profilePicturePath ?? ""} // Placeholder image
            sx={{
              width: { xs: 150, md: 200 },
              height: { xs: 150, md: 200 },
              border: (t) => `4px solid ${t.palette.background.paper}`,
              boxShadow: 3,
            }}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfileDetailBox;
