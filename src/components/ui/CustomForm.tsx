import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid, // Note: in v6 this might be Grid2, sticking to Grid based on context
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

/*
  CustomForm.tsx
  Generic reusable form container component.
  
  Updates:
  - Added 'header' type for section dividers.
  - Improved visual spacing and paper styling.
*/

export type FieldType =
  | "text"
  | "email"
  | "password"
  | "select"
  | "textarea"
  | "number"
  | "checkbox"
  | "date"
  | "hidden"
  | "header"; // <--- Added header type

export type Option = { value: string; label: string };

export type Field = {
  name: string; // Used as key for headers
  label?: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: Option[];
  fullWidth?: boolean;
  helperText?: string;
  rows?: number;
  width?: number | string;
  validate?: (
    value: unknown,
    values: Record<string, unknown>
  ) => string | undefined;
  render?: (props: {
    value: unknown;
    onChange: (v: unknown) => void;
    onBlur: () => void;
    error?: string | undefined;
  }) => React.ReactNode;
};

type Props = {
  title?: string;
  fields: Field[];
  initialValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => Promise<unknown> | void;
  submitLabel?: string;
  submitLoading?: boolean;
  disabled?: boolean;
  maxWidth?: number | string;
  showCancel?: boolean;
  onCancel?: () => void;
  renderFooter?: (state: {
    values: Record<string, unknown>;
    submitting: boolean;
  }) => React.ReactNode;
  children?: React.ReactNode;
};

export default function CustomForm({
  title,
  fields,
  initialValues = {},
  onSubmit,
  submitLabel = "Submit",
  submitLoading,
  disabled,
  maxWidth = 680,
  showCancel = false,
  onCancel,
  renderFooter,
  children,
}: Props) {
  // 1. Initialize values (ignoring headers)
  const normalizedInitials = useMemo(() => {
    const base: Record<string, unknown> = {};
    fields.forEach((f) => {
      if (f.type === "header") return; // Skip headers
      base[f.name] =
        initialValues[f.name] ?? (f.type === "checkbox" ? false : "");
    });
    return base;
  }, [fields, initialValues]);

  const [values, setValues] =
    useState<Record<string, unknown>>(normalizedInitials);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [submitting, setSubmitting] = useState(false);

  const effectiveSubmitting = submitLoading ?? submitting;

  useEffect(() => {
    setValues((v) => ({ ...normalizedInitials, ...v }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(normalizedInitials)]);

  function setField(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
    setErrors((s) => ({ ...s, [name]: undefined }));
  }

  function validateField(field: Field): string | undefined {
    // Skip validation for headers or hidden fields usually
    if (field.type === "header") return undefined;

    const val = values[field.name];
    if (field.required) {
      const empty =
        val === undefined ||
        val === null ||
        (typeof val === "string" && val.trim() === "");
      if (empty) return "This field is required.";
    }
    if (field.validate) return field.validate(val, values);
    if (field.type === "email" && val) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(String(val))) return "Enter a valid email address.";
    }
    return undefined;
  }

  function validateAll(): boolean {
    const next: Record<string, string | undefined> = {};
    fields.forEach((f) => {
      const err = validateField(f);
      if (err) next[f.name] = err;
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (disabled) return;
    if (!validateAll()) return;
    try {
      setSubmitting(true);
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  }

  const renderField = (field: Field) => {
    // Special handling for Header
    if (field.type === "header") {
      return (
        <Box sx={{ mt: 2, mb: 1 }}>
          <Typography
            variant="h6"
            color="primary"
            sx={{ fontWeight: 600, fontSize: "1.1rem" }}
          >
            {field.label}
          </Typography>
          <Divider sx={{ mt: 1 }} />
        </Box>
      );
    }

    const val = values[field.name];
    const error = errors[field.name];

    // Custom Renderer
    if (field.render) {
      return (
        <Box>
          {field.render({
            value: val,
            onChange: (v) => setField(field.name, v),
            onBlur: () =>
              setErrors((s) => ({ ...s, [field.name]: validateField(field) })),
            error,
          })}
          {error && (
            <Typography
              variant="caption"
              color="error"
              sx={{ display: "block", mt: 0.5 }}
            >
              {error}
            </Typography>
          )}
        </Box>
      );
    }

    // Standard Fields
    switch (field.type) {
      case "select":
        return (
          <TextField
            select
            fullWidth={field.fullWidth ?? true}
            label={field.label}
            value={val ?? ""}
            onChange={(e) => setField(field.name, e.target.value)}
            onBlur={() =>
              setErrors((s) => ({ ...s, [field.name]: validateField(field) }))
            }
            helperText={error ?? field.helperText}
            error={Boolean(error)}
            size="small"
          >
            {(field.options ?? []).map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
        );

      case "textarea":
        return (
          <TextField
            multiline
            rows={field.rows ?? 3}
            fullWidth={field.fullWidth ?? true}
            label={field.label}
            placeholder={field.placeholder}
            value={val ?? ""}
            onChange={(e) => setField(field.name, e.target.value)}
            onBlur={() =>
              setErrors((s) => ({ ...s, [field.name]: validateField(field) }))
            }
            helperText={error ?? field.helperText}
            error={Boolean(error)}
            size="small"
          />
        );

      case "checkbox":
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(val)}
                onChange={(e) => setField(field.name, e.target.checked)}
                onBlur={() =>
                  setErrors((s) => ({
                    ...s,
                    [field.name]: validateField(field),
                  }))
                }
              />
            }
            label={field.label}
          />
        );

      case "hidden":
        return (
          <TextField
            fullWidth={field.fullWidth ?? true}
            label={field.label}
            placeholder={field.placeholder}
            value={
              typeof val === "string" ||
              typeof val === "number" ||
              Array.isArray(val)
                ? val
                : ""
            }
            onChange={(e) => setField(field.name, e.target.value)}
          />
        );

      default:
        return (
          <TextField
            fullWidth={field.fullWidth ?? true}
            label={field.label}
            placeholder={field.placeholder}
            value={val ?? ""}
            onChange={(e) =>
              setField(
                field.name,
                field.type === "number"
                  ? e.target.value === ""
                    ? ""
                    : Number(e.target.value)
                  : e.target.value
              )
            }
            onBlur={() =>
              setErrors((s) => ({ ...s, [field.name]: validateField(field) }))
            }
            helperText={error ?? field.helperText}
            error={Boolean(error)}
            size="small"
            type={
              field.type === "number"
                ? "number"
                : field.type === "password"
                ? "password"
                : field.type === "date"
                ? "date"
                : field.type === "email"
                ? "email"
                : "text"
            }
            inputProps={
              field.type === "number" ? { inputMode: "numeric" } : undefined
            }
          />
        );
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2, sm: 4 }, // Responsive padding
        maxWidth,
        width: "100%",
        mx: "auto", // center horizontally
        borderRadius: 2,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 3 }}
      >
        {title && (
          <Box sx={{ textAlign: "center", mb: 1 }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
          </Box>
        )}

        <Grid container spacing={2} alignItems="flex-start">
          {fields.map((f) => {
            // If header, force full width
            const isHeader = f.type === "header";
            const smSize = isHeader
              ? 12
              : typeof f.width === "number" && f.width <= 12
              ? f.width
              : 6;
            const mdSize = isHeader
              ? 12
              : typeof f.width === "number"
              ? f.width
              : 6;

            // Headers don't need 'stretch' alignment
            return (
              <Grid
                size={{ sm: smSize, md: mdSize, xs: 12 }}
                key={f.name}
                sx={{
                  // For headers, allow auto height, otherwise stretch inputs
                  display: isHeader ? "block" : "flex",
                  alignItems: isHeader ? "flex-start" : "stretch",
                }}
              >
                <Box sx={{ width: "100%" }}>{renderField(f)}</Box>
              </Grid>
            );
          })}
        </Grid>

        {children}

        {/* Footer Actions */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
            width: "100%",
            mt: 2,
            pt: 2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          {renderFooter ? (
            renderFooter({ values, submitting: effectiveSubmitting })
          ) : (
            <>
              {showCancel && (
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={onCancel}
                  disabled={effectiveSubmitting}
                  sx={{ minWidth: 100, flex: { xs: 1, sm: "initial" } }}
                >
                  Cancel
                </Button>
              )}

              <Box sx={{ flex: 1, display: { xs: "none", sm: "block" } }} />

              <Button
                type="submit"
                variant="contained"
                disabled={Boolean(disabled) || effectiveSubmitting}
                startIcon={
                  effectiveSubmitting ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : undefined
                }
                sx={{ minWidth: 160, flex: { xs: 1, sm: "initial" }, py: 1 }}
              >
                {effectiveSubmitting ? "Processing..." : submitLabel}
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
