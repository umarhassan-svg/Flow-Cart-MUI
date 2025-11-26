// src/components/admin/ManageUser.tsx
import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import usersService from "../../../services/users.service";
import type {
  Role,
  CreateUserPayload,
  UpdateUserPayload,
} from "../../../types/UsersService";
import type { User } from "../../../types/User";
import OpenPDFDialogBox from "../OpenPDFDialogBox/OpenPDFDialogBox";
import PDFUploadField from "../TextFieldPDF Upload/PDFUploadField";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  roles: Role[];
  initialUser?: User;
  onClose: () => void;
  onSaved?: () => void;
};

const ManageUser = ({
  open,
  mode,
  roles = [],
  initialUser,
  onClose,
  onSaved,
}: Props) => {
  const theme = useTheme();

  const [name, setName] = useState(initialUser?.name ?? "");
  const [email, setEmail] = useState(initialUser?.email ?? "");
  const [password, setPassword] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    initialUser?.roles ?? []
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // when dialog opens or initialUser changes, sync fields
    setName(initialUser?.name ?? "");
    setEmail(initialUser?.email ?? "");
    setPassword("");
    setSelectedRoles(initialUser?.roles ?? []);
  }, [initialUser, open]);

  // available (ungiven) roles for dropdown
  const availableRolesToShow = roles
    .map((r) => r.name)
    .filter((roleName) => !selectedRoles.includes(roleName));

  const handleRoleChange = (e: unknown) => {
    const val: string | React.ChangeEvent<HTMLSelectElement> = e as
      | string
      | React.ChangeEvent<HTMLSelectElement>;
    if (typeof val === "string") setSelectedRoles(val.split(","));
    else
      setSelectedRoles(
        (val as React.ChangeEvent<HTMLSelectElement>).target.value
          .toString()
          .split(",")
      );
  };

  const handleRemoveRole = (roleName: string) => {
    setSelectedRoles((prev) => prev.filter((r) => r !== roleName));
  };

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setSelectedRoles([]);
    setPdfFile(null);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  // inside ManageUser component (assumes pdfFile, pdfUrl, setPdfUrl exist)
  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      alert("Name and email are required");
      return;
    }

    setLoading(true);
    try {
      let savedUserId: string | undefined;

      if (mode === "create") {
        const payload: CreateUserPayload = {
          name: name.trim(),
          email: email.trim(),
          password: password || undefined,
          roles: selectedRoles,
        };
        const created = await usersService.createUser(payload);
        // adjust depending on your API response shape
        savedUserId = created.id;
      } else {
        if (!initialUser) throw new Error("No user selected for edit");
        const payload: UpdateUserPayload = {
          name: name.trim(),
          email: email.trim(),
          roles: selectedRoles,
        };
        await usersService.updateUser(initialUser.id, payload);
        savedUserId = initialUser.id;
      }

      // If a PDF was selected, upload it now and replace local object URL with server URL
      if (pdfFile && savedUserId) {
        try {
          const uploadRes = await usersService.uploadEmployeeCard(
            savedUserId,
            pdfFile
          );
          // uploadRes should contain the final URL (e.g. { url: 'https://...' })
          if (uploadRes?.url) {
            // revoke local object URL if it exists
            if (pdfUrl && pdfUrl.startsWith("blob:")) {
              URL.revokeObjectURL(pdfUrl);
            }
            setPdfUrl(uploadRes.url); // now preview uses permanent URL
          }
        } catch (uploadErr) {
          console.error("Failed to upload pdf:", uploadErr);
          // optionally show user a non-blocking warning
          alert("User saved but PDF upload failed.");
        }
      }

      // finished successfully
      reset();
      if (onSaved) onSaved();
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) alert(err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  //----------------------------------------------------------------
  // PDF state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);

  useEffect(() => {
    // when dialog opens or initialUser changes, sync fields
    setName(initialUser?.name ?? "");
    setEmail(initialUser?.email ?? "");
    setPassword("");
    setSelectedRoles(initialUser?.roles ?? []);
    // clear pdf fields when opening form for new user or editing different user
    setPdfFile(null);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  }, [initialUser, open]);

  // create object URL when pdfFile changes
  useEffect(() => {
    if (!pdfFile) {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
      return;
    }
    const url = URL.createObjectURL(pdfFile);
    // revoke previous if any
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(url);

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfFile]);
  //=========================================================

  // --- add this effect to fetch preuploaded card when editing/opening ---
  useEffect(() => {
    let cancelled = false;

    const loadExistingCard = async () => {
      if (!open) return; // only load when dialog is open
      if (!initialUser?.id) return;

      try {
        const serverUrl = await usersService.getEmployeeCardUrl(initialUser.id);
        if (cancelled) return;

        if (serverUrl) {
          // If there is a local object URL currently, revoke it first
          if (pdfUrl && pdfUrl.startsWith("blob:")) {
            URL.revokeObjectURL(pdfUrl);
          }
          // set server URL directly (do NOT revoke it later as it's not a blob)
          setPdfUrl(serverUrl);
        } else {
          // no server url -- leave pdfUrl null
          // optional: setPdfUrl(null);
        }
      } catch (err) {
        console.warn("Failed to load existing employee card:", err);
      }
    };

    loadExistingCard();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUser?.id, open]);

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            {mode === "create" ? <PersonAddIcon /> : <EditIcon />}
            <span>{mode === "create" ? "Create User" : "Edit User"}</span>
          </Box>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            maxHeight: "50vh",
            overflowY: "auto",
          }}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Box display="flex" gap={2} alignItems="center">
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  {mode === "create" ? <PersonAddIcon /> : <EditIcon />}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {mode === "create"
                      ? "Add new user"
                      : `Update ${initialUser?.name ?? ""}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {mode === "create"
                      ? "Create a user and assign roles. Password optional."
                      : "Update user details and roles."}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Full name"
                size="small"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Email"
                size="small"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>

            {mode === "create" && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Password"
                  placeholder="Optional"
                  type="password"
                  size="small"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <InputLabel sx={{ mb: 0.5 }}>Roles</InputLabel>
              <Select
                multiple
                fullWidth
                size="small"
                value={selectedRoles}
                onChange={handleRoleChange}
                renderValue={(selected) =>
                  (selected as string[]).length === 0 ? (
                    <Typography color="text.secondary">Select roles</Typography>
                  ) : (
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {(selected as string[]).map((r) => (
                        <Chip
                          key={r}
                          label={r}
                          size="small"
                          onDelete={() => handleRemoveRole(r)}
                          deleteIcon={<CloseIcon fontSize="small" />}
                          onMouseDown={(e) => e.stopPropagation()}
                        />
                      ))}
                    </Box>
                  )
                }
              >
                {availableRolesToShow.length === 0 ? (
                  <MenuItem value="" disabled>
                    All roles assigned
                  </MenuItem>
                ) : (
                  availableRolesToShow.map((roleName) => (
                    <MenuItem key={roleName} value={roleName}>
                      {roleName}
                    </MenuItem>
                  ))
                )}
              </Select>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <PDFUploadField
                label="Employee Card (PDF)"
                helperText="Upload employee card / ID (PDF only)"
                onFileChange={(f) => setPdfFile(f)}
                onView={() => {
                  if (pdfUrl) setPdfDialogOpen(true);
                }}
                fileUrl={pdfUrl}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} /> : undefined}
          >
            {mode === "create" ? "Create user" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <OpenPDFDialogBox
        open={pdfDialogOpen}
        pdfUrl={pdfUrl}
        title="Employee Card"
        onClose={() => setPdfDialogOpen(false)}
      />
    </>
  );
};

export default ManageUser;
