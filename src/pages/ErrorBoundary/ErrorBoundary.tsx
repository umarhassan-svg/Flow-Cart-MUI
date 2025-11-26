import React from "react";
import { Box, Paper, Typography, Button, Stack } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

type Props = {
  title?: string;
  message?: string;
  supportEmail?: string;
  showReload?: boolean;
  showReport?: boolean;
  onReset?: () => void;
  onReport?: () => void; // optional hook to send a report without exposing details
  children?: React.ReactNode;
};

type State = { hasError: boolean };

// MUI-friendly Error Boundary: shows a simple, non-technical message to end users.
export default class FriendlyErrorBoundary extends React.Component<
  Props,
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Do not display technical details to users.
    // If you have a telemetry/reporting function, call it here quietly.
    // Example: (window as any).__SEND_LOG__?.({ error, info });
    // try {
    //   if (window.__SEND_LOG__) {
    //     window.__SEND_LOG__({ error, info });
    //   }
    // } catch {
    //   // swallow any errors from logging
    // }

    if (process.env.NODE_ENV !== "production") {
      // keep console output for local dev only
      console.error(error, info);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false }, () => {
      if (this.props.onReset) this.props.onReset();
      else window.location.reload();
    });
  };

  handleReport = () => {
    if (this.props.onReport) return this.props.onReport();
    if (this.props.supportEmail) {
      const mailto = `mailto:${this.props.supportEmail}?subject=App%20error%20report`;
      window.location.href = mailto;
    }
  };

  render() {
    if (!this.state.hasError)
      return (this.props.children as React.ReactElement) || null;

    const {
      title = "Something went wrong",
      message = "Sorry — we couldn’t load this part of the app. Please try again or contact support.",
      supportEmail = "flowcart-support@example.com",
      showReload = true,
      showReport = true,
    } = this.props;

    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
          backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            maxWidth: 520,
            width: "100%",
            p: 4,
            textAlign: "center",
            borderRadius: 2,
          }}
        >
          <Stack spacing={2} alignItems="center">
            <ErrorOutlineIcon color="error" sx={{ fontSize: 48 }} />

            <Typography variant="h6" component="h2">
              {title}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {message}
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ mt: 1 }}
            >
              {showReload && (
                <Button variant="contained" onClick={this.handleReset}>
                  Try again
                </Button>
              )}

              {showReport && supportEmail && (
                <Button
                  component="a"
                  href={`mailto:${supportEmail}?subject=${encodeURIComponent(
                    "App error report"
                  )}`}
                  variant="outlined"
                >
                  Contact support
                </Button>
              )}
            </Stack>

            <Typography variant="caption" color="text.disabled" sx={{ mt: 1 }}>
              If this keeps happening, please contact support.
            </Typography>

            {!supportEmail && showReport && (
              <Typography variant="caption" color="text.disabled">
                (No support contact provided)
              </Typography>
            )}
          </Stack>
        </Paper>
      </Box>
    );
  }
}
