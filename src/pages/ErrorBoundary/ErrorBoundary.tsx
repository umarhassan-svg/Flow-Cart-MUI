// src/components/ErrorBoundary.tsx
import { Component, type ReactNode } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode; // optional custom fallback
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
  errorTime?: string;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    const time = new Date().toLocaleString();
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo: errorInfo.componentStack, errorTime: time });

    // Optional: Send error to external logging service
    // sendErrorToService({ error, errorInfo, time });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  handleCopy = () => {
    const { error, errorInfo, errorTime } = this.state;
    const details = `
Error: ${error?.message || "N/A"}
Time: ${errorTime || "N/A"}
Stack: ${error?.stack || "N/A"}
Component Stack: ${errorInfo || "N/A"}
    `;
    navigator.clipboard.writeText(details);
    alert("Error details copied to clipboard!");
  };

  render() {
    const { hasError, error, errorInfo, errorTime } = this.state;

    if (hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          height="100vh"
          textAlign="center"
          p={2}
          bgcolor="#fdf2f2"
        >
          <ErrorOutlineIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h3" gutterBottom color="error">
            Oops! Something went wrong.
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            {error?.message || "An unexpected error occurred."}
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="center" mb={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleReload}
            >
              Reload Page
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => (window.location.href = "/")}
            >
              Go Home
            </Button>
            <Tooltip title="Copy error details">
              <IconButton color="secondary" onClick={this.handleCopy}>
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          <Paper
            variant="outlined"
            sx={{
              textAlign: "left",
              maxWidth: "80%",
              p: 2,
              bgcolor: "#fff4f4",
              overflow: "auto",
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold" mb={1}>
              Error Details
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="body2" color="text.primary">
              <strong>Time:</strong> {errorTime || "N/A"}
            </Typography>
            <Typography variant="body2" color="text.primary">
              <strong>Message:</strong> {error?.message || "N/A"}
            </Typography>
            {error?.stack && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: "pre-wrap", mt: 1 }}
              >
                <strong>Stack Trace:</strong>
                {"\n" + error.stack}
              </Typography>
            )}
            {errorInfo && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: "pre-wrap", mt: 1 }}
              >
                <strong>Component Stack:</strong>
                {"\n" + errorInfo}
              </Typography>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}
