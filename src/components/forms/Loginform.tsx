/**
 * MUI Professional Login Form
 * Single-file React (TypeScript) component using MUI v5.
 * Features:
 *  - Responsive layout (Container, Box)
 *  - Email + password inputs with validation and helpful error messages
 *  - Password visibility toggle
 *  - Remember me checkbox
 *  - Forgot password link area
 *  - Accessibility attributes, autoComplete, and keyboard submission
 *  - Loading state with CircularProgress
 *  - Form-level error Alert
 *  - Optional social sign-in buttons (Google, GitHub)
 *  - Hooks-friendly: accepts an onSubmit prop for real integration
 *
 * Usage:
 * <LoginForm onSubmit={async (values) => { await api.login(values); }} />
 */

import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  SvgIcon,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import type { LoginValues } from "../../types/UserTypes";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginForm = () => {
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
    setLoading(true);

    if (!validate()) {
      setLoading(false);
      return;
    }

    try {
      await login(values.email, values.password);
      navigate("/home");
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setFormError((err as any).message || "Login failed");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }

  function handleChange<K extends keyof LoginValues>(
    key: K,
    val: LoginValues[K]
  ) {
    setValues((s) => ({ ...s, [key]: val }));
    // live validation: clear that field's error
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    setFormError(null);
  }

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          bgcolor: "background.paper",
          p: { xs: 3, sm: 4 },
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
          <LockOutlinedIcon />
        </Avatar>

        <Typography component="h1" variant="h5">
          Sign in
        </Typography>

        {formError && (
          <Alert severity="error" sx={{ width: "100%" }}>
            {formError}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ mt: 1, width: "100%" }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={values.email}
            onChange={(e) => handleChange("email", e.target.value)}
            error={Boolean(fieldErrors.email)}
            helperText={fieldErrors.email}
            inputProps={{ "aria-label": "email address" }}
          />

          <TextField
            margin="normal"
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
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(values.remember)}
                  onChange={(e) => handleChange("remember", e.target.checked)}
                  color="primary"
                />
              }
              label="Remember me"
            />

            <Link href="#" variant="body2" onClick={(e) => e.preventDefault()}>
              Forgot password?
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 2, mb: 1, py: 1.2 }}
            aria-label="sign in"
          >
            {loading ? <CircularProgress size={20} /> : "Sign In"}
          </Button>

          <Divider sx={{ my: 2 }}>Or continue with</Divider>

          <Grid container justifyContent="center" spacing={1}>
            <Grid>
              <Button
                fullWidth
                variant="outlined"
                onClick={() =>
                  alert(
                    "Social sign-in (Google) click — integrate your flow here"
                  )
                }
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

            <Grid>
              <Button
                fullWidth
                variant="outlined"
                onClick={() =>
                  alert(
                    "Social sign-in (GitHub) click — integrate your flow here"
                  )
                }
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

          <Grid container justifyContent="center" sx={{ mt: 3 }}>
            <Grid>
              <Typography variant="body2">
                Don\'t have an account?&nbsp;
                <Link href="#" onClick={(e) => e.preventDefault()}>
                  Sign Up
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginForm;
