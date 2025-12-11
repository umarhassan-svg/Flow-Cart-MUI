/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/forms/ContactForm.tsx
import React, { useState } from "react";
import {
  Box,
  Snackbar,
  Alert,
  CircularProgress,
  Typography,
  useTheme,
  alpha,
  Fade,
  TextField,
  MenuItem,
  Button,
  InputAdornment,
  Grid, // Using Grid for the 2-column layout
  Divider,
} from "@mui/material";

// Icons
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import TopicOutlinedIcon from "@mui/icons-material/TopicOutlined";
import SendIcon from "@mui/icons-material/Send";

// Form State Interface
interface ContactFormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactForm: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    severity: "success" | "error";
    message: string;
  }>({ open: false, severity: "success", message: "" });

  const [formData, setFormData] = useState<ContactFormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<Partial<ContactFormState>>({});

  const subjectOptions = [
    { label: "General Inquiry", value: "general" },
    { label: "Billing & Invoices", value: "billing" },
    { label: "Technical Support", value: "technical" },
    { label: "Business Partnerships", value: "partnerships" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactFormState]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<ContactFormState> = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
      isValid = false;
    }

    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email address";
      isValid = false;
    }

    if (!formData.subject) {
      newErrors.subject = "Please select a topic";
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message cannot be empty";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const backendBase = import.meta.env.VITE_BACKEND_URL || "";
      const res = await fetch(`${backendBase.replace(/\/$/, "")}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to send contact request");
      }

      setSnackbar({
        open: true,
        severity: "success",
        message: "Message sent! We'll get back to you shortly.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      console.error("Contact submit error:", err);
      setSnackbar({
        open: true,
        severity: "error",
        message: err?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      {/* FIXED HEADER SECTION
        This stays at the top and does not scroll.
      */}
      <Box
        sx={{
          px: 3,
          py: 1,
          flexShrink: 0,
          borderTop: 1,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="h5" fontWeight="800" color="text.primary">
          Get in Touch
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Fill out the form below and we'll respond within 24 hours.
        </Typography>
      </Box>

      <Divider sx={{ mb: 0 }} />

      {/* SCROLLABLE FORM CONTENT
        The form tag wraps this section.
      */}
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit}
        sx={{
          p: 3,
          // Removed flexGrow and overflowY to disable the slider
          height: "auto",
          opacity: loading ? 0.5 : 1,
          transition: "opacity 0.2s",
        }}
      >
        <Grid container spacing={3}>
          {/* Row 1: Name and Email (Side by Side) */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Full Name"
              name="name"
              placeholder="Ex: Jane Doe"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Email Address"
              name="email"
              type="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Row 2: Subject (Full Width) */}
          <Grid size={{ xs: 12 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Topic"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              error={!!errors.subject}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TopicOutlinedIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            >
              {subjectOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Row 3: Message (Full Width) */}
          <Grid size={12}>
            <TextField
              fullWidth
              size="small"
              label="How can we help?"
              name="message"
              multiline
              minRows={4}
              placeholder="Please provide as much detail as possible..."
              value={formData.message}
              onChange={handleChange}
              error={!!errors.message}
            />
          </Grid>

          {/* Row 4: Submit Button */}
          <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              endIcon={<SendIcon />}
              sx={{
                py: 1.5,
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
                boxShadow: theme.shadows[4],
              }}
            >
              Send Message
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Loading Overlay */}
      <Fade in={loading}>
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(theme.palette.background.paper, 0.7),
            zIndex: 10,
            backdropFilter: "blur(2px)",
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      </Fade>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", boxShadow: 3, borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactForm;
