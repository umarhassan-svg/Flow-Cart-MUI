import React from "react";
import { useLocation } from "react-router-dom"; // Import useLocation
import { Box, Paper, Typography, Button, Stack } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

// --- Props Type ---
type Props = {
  title?: string;
  message?: string;
  supportEmail?: string;
  showReload?: boolean;
  showReport?: boolean;
  onReset?: () => void;
  onReport?: () => void;
  children?: React.ReactNode;
  location?: ReturnType<typeof useLocation>;
};

type State = { hasError: boolean };

class FriendlyErrorBoundaryClass extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  // --- FIX: Implement logic to reset hasError when navigation changes ---
  componentDidUpdate(prevProps: Props) {
    const currentLocation = this.props.location;
    const prevLocation = prevProps.location;

    if (
      this.state.hasError &&
      currentLocation &&
      prevLocation &&
      currentLocation.key !== prevLocation.key
    ) {
      this.setState({ hasError: false });
    }
  }
  // ---------------------------------------------------------------------

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
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
                  onClick={this.handleReport}
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

export default function FriendlyErrorBoundary(props: Omit<Props, "location">) {
  const location = useLocation();
  return (
    <FriendlyErrorBoundaryClass {...props} location={location}>
      {props.children}
    </FriendlyErrorBoundaryClass>
  );
}