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
} from "../../../services/users.service";
import type { User } from "../../../services/auth.service";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  roles: Role[];
  initialUser?: User;
  onClose: () => void;
  onSaved?: () => void;
};

const ManageUser: React.FC<Props> = ({
  open,
  mode,
  roles = [],
  initialUser,
  onClose,
  onSaved,
}) => {
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
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      alert("Name and email are required");
      return;
    }

    setLoading(true);
    try {
      if (mode === "create") {
        const payload: CreateUserPayload = {
          name: name.trim(),
          email: email.trim(),
          password: password || undefined,
          roles: selectedRoles,
        };
        await usersService.createUser(payload);
        reset();
        if (onSaved) onSaved();
      } else {
        if (!initialUser) {
          throw new Error("No user selected for edit");
        }
        const payload: UpdateUserPayload = {
          name: name.trim(),
          email: email.trim(),
          roles: selectedRoles,
        };
        await usersService.updateUser(initialUser.id, payload);
        if (onSaved) onSaved();
      }
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) alert(err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          {mode === "create" ? <PersonAddIcon /> : <EditIcon />}
          <span>{mode === "create" ? "Create User" : "Edit User"}</span>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
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
  );
};

export default ManageUser;
