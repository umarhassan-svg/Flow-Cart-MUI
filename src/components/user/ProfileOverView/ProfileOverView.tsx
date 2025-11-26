import {
  Avatar,
  Grid,
  Typography,
  Box,
  Paper,
  IconButton,
  Container,
  Button,
} from "@mui/material";
import { CameraAlt } from "@mui/icons-material";
import { useAuth } from "../../../context/AuthContext";
import ProfileCard from "../ProfileCard/ProfileCard";
import InfoField from "../../ui/InfoField";
import usersService from "../../../services/users.service";
import { useState } from "react";
import OpenPDFDialogBox from "../../admin/OpenPDFDialogBox/OpenPDFDialogBox";

const ProfileOverView = () => {
  const { can, user } = useAuth();

  // Mock data parsing to match the "First Name / Last Name" split in image
  const names = (user?.name || "Natashia Khaleira").split(" ");
  const firstName = names[0];
  const lastName = names.slice(1).join(" ") || "";

  const onEdit = (mode: string) => {
    console.log("Edit mode:", mode);
  };

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const handleEmployeeCard = (
    id: string
  ): React.MouseEventHandler<HTMLButtonElement> | undefined => {
    if (!id) return undefined;

    return async (e) => {
      e.stopPropagation();
      setPreviewLoading(true);
      try {
        // try fetching a stored server URL for this user's employee card
        const url = await usersService.getEmployeeCardUrl(id);
        if (!url) {
          alert("No employee card available for this user.");
          return;
        }

        // if the url is relative (e.g. "/api/..."), we can use it directly in iframe.
        // If you want a full absolute URL: const full = `${window.location.origin}${url}`;
        setPdfUrl(url);
        setPdfDialogOpen(true);
      } catch (err) {
        console.error("Failed to load employee card:", err);
        alert("Failed to load employee card.");
      } finally {
        setPreviewLoading(false);
      }
    };
  };

  return (
    <>
      <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "100vh",
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              mb: 3,
              display: "flex",
              flexDirection: { xs: "column", sm: "column", md: "row" },
              alignItems: { xs: "flex-start", md: "center" },
              gap: 3,
              boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            {/* Avatar with Camera Icon Overlay */}
            <Box sx={{ position: "relative" }}>
              <Avatar
                src="/static/images/avatar/1.jpg"
                sx={{
                  width: 80,
                  height: 80,
                  border: "3px solid #fff",
                  boxShadow: 2,
                }}
              />
              <IconButton
                size="small"
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: -4,
                  backgroundColor: "primary.main",
                  color: "white",
                  border: "2px solid white",
                  "&:hover": { backgroundColor: "#0a3626" },
                }}
              >
                <CameraAlt sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={700} color={"text.primary"}>
                {user?.name || "Natashia Khaleira"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.roles?.[0] || "Admin"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Leeds, United Kingdom
              </Typography>
            </Box>
            {can("employees:read") && (
              <Box sx={{ mr: "auto" }}>
                <Button
                  size="small"
                  onClick={handleEmployeeCard(user?.id ?? "")}
                  disabled={!user?.id || previewLoading}
                >
                  {previewLoading ? "Loading..." : "View Employee Card"}
                </Button>
              </Box>
            )}
          </Paper>

          {/* ==== CARD 2: PERSONAL INFORMATION ==== */}
          <ProfileCard title="Personal Information" onEdit={() => {}}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 4 }}>
                <InfoField label="First Name" value={firstName} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <InfoField label="Last Name" value={lastName} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <InfoField
                  label="Date of Birth"
                  value={new Date().toLocaleDateString()}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <InfoField
                  label="Email Address"
                  value={user?.email || "info@example.com"}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <InfoField label="Phone Number" value="+92 123 456 789" />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <InfoField
                  label="User Role"
                  value={user?.roles?.[0] || "Admin"}
                />
              </Grid>
            </Grid>
          </ProfileCard>

          {/* ==== CARD 3: ADDRESS ==== */}
          <ProfileCard title="Address" onEdit={onEdit}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 4 }}>
                <InfoField label="Country" value="United Kingdom" />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <InfoField label="City" value="Leeds, East London" />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <InfoField label="Postal Code" value="ERT 1254" />
              </Grid>
            </Grid>
          </ProfileCard>
        </Container>
      </Box>
      <OpenPDFDialogBox
        open={pdfDialogOpen}
        pdfUrl={pdfUrl}
        title="Employee Card"
        onClose={() => {
          setPdfDialogOpen(false);
          // optionally clear url after closing:
          // setPdfUrl(null);
        }}
      />
    </>
  );
};

export default ProfileOverView;
