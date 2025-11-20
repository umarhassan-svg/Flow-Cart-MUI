// src/components/forms/LoginForm.tsx
import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  SvgIcon,
  Stack,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import type { LoginValues } from "../../types/User";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginForm = () => {
  const [values, setValues] = useState<LoginValues>({
    email: "",
    password: "",
    remember: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LoginValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  function validate(): boolean {
    const errors: Partial<Record<keyof LoginValues, string>> = {};
    if (!values.email) errors.email = "Email is required.";
    else if (!emailRegex.test(values.email))
      errors.email = "Enter a valid email address.";

    if (!values.password) errors.password = "Password is required.";
    else if (values.password.length < 6)
      errors.password = "Password must be at least 6 characters.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await login(values.email, values.password);
      navigate("/home");
    } catch (err: unknown) {
      // map an error message (server / thrown)
      const message =
        (err as { message?: string })?.message ??
        "Login failed — please try again.";
      setFormError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange<K extends keyof LoginValues>(
    key: K,
    val: LoginValues[K]
  ) {
    setValues((s) => ({ ...s, [key]: val }));
    setFieldErrors((p) => ({ ...p, [key]: undefined }));
    setFormError(null);
  }

  return (
    <Paper
      elevation={2}
      role="form"
      aria-label="Sign in form"
      sx={{
        width: "100%",
        maxWidth: 460,
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.paper",
        p: { xs: 2, sm: 3 },
        boxSizing: "border-box",
        borderRadius: 2,
      }}
    >
      <Box sx={{ width: "100%" }}>
        <Stack spacing={2}>
          {/* header */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Box>
              <Typography variant="h2" sx={{ fontWeight: 700 }}>
                Sign in
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Welcome back — please enter your credentials.
              </Typography>
            </Box>
          </Stack>

          {/* collapsible error area */}
          <Collapse in={Boolean(formError)}>
            {formError && (
              <Alert severity="error" onClose={() => setFormError(null)}>
                {formError}
              </Alert>
            )}
          </Collapse>

          {/* form */}
          <Box component="form" noValidate onSubmit={handleSubmit}>
            <Stack spacing={1.25}>
              <TextField
                size="small"
                margin="dense"
                required
                fullWidth
                id="email"
                label="Email address"
                name="email"
                autoComplete="email"
                autoFocus
                value={values.email}
                onChange={(e) => handleChange("email", e.target.value)}
                error={Boolean(fieldErrors.email)}
                helperText={fieldErrors.email}
                inputProps={{ "aria-label": "email address" }}
                disabled={loading}
              />

              <TextField
                size="small"
                margin="dense"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={values.password}
                onChange={(e) => handleChange("password", e.target.value)}
                error={Boolean(fieldErrors.password)}
                helperText={fieldErrors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowPassword((s) => !s)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                disabled={loading}
              />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={Boolean(values.remember)}
                      onChange={(e) =>
                        handleChange("remember", e.target.checked)
                      }
                      color="primary"
                      disabled={loading}
                    />
                  }
                  label={<Typography variant="body2">Remember me</Typography>}
                />

                <Link
                  href="#"
                  variant="body2"
                  onClick={(e) => e.preventDefault()}
                  sx={{ whiteSpace: "nowrap" }}
                >
                  Forgot password?
                </Link>
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="medium"
                sx={{ py: 1.1 }}
                disabled={loading}
                aria-label="Sign in"
              >
                {loading ? <CircularProgress size={18} /> : "Sign In"}
              </Button>

              <Divider sx={{ my: 0.75 }}>Or continue with</Divider>

              <Grid container spacing={1}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      alert("Social sign-in (Google) — integrate here")
                    }
                    sx={{
                      transition: "0.2s ease",
                      "&:hover": {
                        borderColor: "primary.main",
                        transform: "translateY(-2px)",
                      },
                    }}
                    startIcon={
                      <SvgIcon fontSize="small" viewBox="0 0 24 24">
                        <path
                          d="M21.35 11.1h-9.18v2.92h5.26c-.23 1.28-1.35 3.73-5.26 3.73-3.17 0-5.76-2.61-5.76-5.83s2.59-5.83 5.76-5.83c1.8 0 3.01.77 3.7 1.43l2.52-2.43C17.98 3.2 15.76 2 12.17 2 6.72 2 2.35 6.42 2.35 12s4.37 10 9.82 10c8.58 0 9.18-7 9.18-10.9 0-.73-.08-1.27-.99-2z"
                          fill="currentColor"
                        />
                      </SvgIcon>
                    }
                  >
                    Google
                  </Button>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      alert("Social sign-in (GitHub) — integrate here")
                    }
                    sx={{
                      transition: "0.2s ease",
                      "&:hover": {
                        borderColor: "primary.main",
                        transform: "translateY(-2px)",
                      },
                    }}
                    startIcon={
                      <SvgIcon fontSize="small" viewBox="0 0 24 24">
                        <path
                          d="M12 2C6.48 2 2 6.58 2 12.19c0 4.52 2.87 8.36 6.84 9.71.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.22-3.37-1.22-.45-1.18-1.1-1.5-1.1-1.5-.9-.62.07-.61.07-.61 1 .07 1.53 1.05 1.53 1.05.89 1.55 2.34 1.1 2.91.84.09-.66.35-1.1.63-1.36-2.22-.26-4.55-1.12-4.55-4.98 0-1.1.39-2 .1-2.71 0 0 .84-.27 2.75 1.04A9.3 9.3 0 0112 7.58c.85.004 1.71.116 2.51.34 1.9-1.31 2.74-1.04 2.74-1.04.49 1.26.18 2.11.09 2.34.62.68 1.01 1.55 1.01 2.78 0 3.87-2.34 4.71-4.57 4.96.35.31.66.92.66 1.86 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10.23 10.23 0 0022 12.19C22 6.58 17.52 2 12 2z"
                          fill="currentColor"
                        />
                      </SvgIcon>
                    }
                  >
                    GitHub
                  </Button>
                </Grid>
              </Grid>

              <Box sx={{ textAlign: "center", mt: 1 }}>
                <Typography
                  variant="body2"
                  component="div"
                  color="text.secondary"
                >
                  Don't have an account?{" "}
                  <Link href="#" onClick={(e) => e.preventDefault()}>
                    Sign Up
                  </Link>
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};

export default LoginForm;
