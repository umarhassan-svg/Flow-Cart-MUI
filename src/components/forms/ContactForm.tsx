/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/forms/ContactForm.tsx
import React, { useState } from "react";
import CustomForm from "../CustomUI/CustomForms/CustomForm";
import type { Schema } from "../../types/FormTypes";
import {
  Box,
  Snackbar,
  Alert,
  CircularProgress,
  Typography,
  useTheme,
  alpha,
  Fade,
} from "@mui/material";

const ContactForm: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    severity: "success" | "error";
    message: string;
  }>({ open: false, severity: "success", message: "" });

  const schema: Schema = {
    fields: [
      {
        component: "TEXT_FIELD",
        name: "name",
        label: "Full Name",
        type: "text",
        placeholder: "Ex: Jane Doe",
        isRequired: true,
        validate: ["REQUIRED"],
      },
      {
        component: "TEXT_FIELD",
        name: "email",
        label: "Email Address",
        type: "email",
        placeholder: "name@company.com",
        isRequired: true,
        validate: [
          "REQUIRED",
          {
            type: "PATTERN",
            pattern: "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$",
            message: "Please enter a valid email",
          },
        ],
      },
      {
        component: "SELECT",
        name: "subject",
        label: "Topic",
        options: [
          { label: "General Inquiry", value: "general" },
          { label: "Billing & Invoices", value: "billing" },
          { label: "Technical Support", value: "technical" },
          { label: "Business Partnerships", value: "partnerships" },
        ],
        isRequired: true,
        validate: ["REQUIRED"],
      },
      {
        component: "TEXT_FIELD",
        name: "message",
        label: "How can we help?",
        type: "textarea",
        placeholder: "Please provide as much detail as possible...",
        isRequired: true,
        validate: ["REQUIRED"],
      },
    ],
  };

  const handleSubmit = async (data: Record<string, any>) => {
    setLoading(true);
    try {
      const backendBase = import.meta.env.VITE_BACKEND_URL || "";
      const res = await fetch(`${backendBase.replace(/\/$/, "")}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >      

      {/* Scrollable Form Content */}
      <Box 
        sx={{ 
          flexGrow: 1,
          overflowY: 'auto',
          px: 3,
          pb: 3,
          opacity: loading ? 0.5 : 1,
          transition: "opacity 0.2s",
          '&::-webkit-scrollbar': { 
            width: '8px' 
          },
          '&::-webkit-scrollbar-track': { 
            background: alpha(theme.palette.divider, 0.1),
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(theme.palette.primary.main, 0.3),
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.5),
            }
          },
        }}
      >
        <Box 
        sx={{ 
          p: 3,
          pb: 2,
        }}
      >
        <Typography variant="h5" fontWeight="700" gutterBottom>
          Get in Touch
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fill out the form below and we'll respond within 24 hours.
        </Typography>
      </Box>

        <CustomForm schema={schema} onSubmit={handleSubmit} />
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
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      </Fade>

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