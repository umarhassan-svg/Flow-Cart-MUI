// src/components/admin/ManageRole/ManageRole.tsx
import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import {
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
  FormHelperText,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import rolesService, { type Role } from "../../../services/roles.service";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initialRole?: Role;
  onClose: () => void;
  onSaved?: () => void;
};

const ManageRole: React.FC<Props> = ({
  open,
  mode,
  initialRole,
  onClose,
  onSaved,
}) => {
  const [name, setName] = useState(initialRole?.name ?? "");
  const [pages, setPages] = useState<string[]>(initialRole?.pages ?? []);
  const [permissions, setPermissions] = useState<string[]>(
    initialRole?.permissions ?? []
  );
  const [availablePermissions, setAvailablePermissions] = useState<
    string[] | null
  >(null);

  const [loading, setLoading] = useState(false);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // load permissions (admin's master permissions list) when dialog opens
  useEffect(() => {
    let mounted = true;
    const loadPerms = async () => {
      setLoadingPerms(true);
      try {
        const perms = await rolesService.getPermissions();
        if (!mounted) return;
        setAvailablePermissions(perms);
      } catch (err: unknown) {
        console.error("Failed to load permissions", err);
        if (mounted) setAvailablePermissions([]);
      } finally {
        if (mounted) setLoadingPerms(false);
      }
    };

    if (open) loadPerms();

    return () => {
      mounted = false;
    };
  }, [open]);

  // sync with initialRole when it changes
  useEffect(() => {
    setName(initialRole?.name ?? "");
    setPages(initialRole?.pages ?? []);
    setPermissions(initialRole?.permissions ?? []);
    setError(null);
  }, [initialRole, open]);

  const allPages = ["dashboard", "users", "roles", "products", "orders"]; // replace or load dynamically

  // compute the items that are NOT already assigned (ungiven)
  const availablePagesToShow = allPages.filter((p) => !pages.includes(p));
  const availablePermissionsToShow = (availablePermissions ?? []).filter(
    (p) => !permissions.includes(p)
  );

  const handlePagesChange = (e: unknown) => {
    const val = e as string | React.ChangeEvent<HTMLSelectElement>;
    if (typeof val === "string") setPages(val.split(","));
    else
      setPages(
        (val as React.ChangeEvent<HTMLSelectElement>).target
          .value as unknown as string[]
      );
  };

  const handlePermissionsChange = (e: unknown) => {
    const val = e as string | React.ChangeEvent<HTMLSelectElement>;
    if (typeof val === "string") setPermissions(val.split(","));
    else
      setPermissions(
        (val as React.ChangeEvent<HTMLSelectElement>).target
          .value as unknown as string[]
      );
  };

  const handleRemovePermission = (perm: string) => {
    setPermissions((prev) => prev.filter((p) => p !== perm));
  };

  const handleRemovePage = (pg: string) => {
    setPages((prev) => prev.filter((p) => p !== pg));
  };

  const resetForm = () => {
    setName("");
    setPages([]);
    setPermissions([]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Role name is required");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      if (mode === "create") {
        await rolesService.createRole({
          name: name.trim(),
          pages,
          permissions,
        });
        resetForm();
      } else {
        if (!initialRole) throw new Error("No role selected for edit");
        await rolesService.updateRole(initialRole.id, {
          name: name.trim(),
          pages,
          permissions,
        });
      }

      if (onSaved) onSaved();
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          {mode === "create" ? <AddCircleOutlineIcon /> : <EditIcon />}
          <span>{mode === "create" ? "Create Role" : "Edit Role"}</span>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Role name"
              size="small"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <InputLabel sx={{ mb: 0.5 }}>Pages</InputLabel>
            <Select
              multiple
              fullWidth
              size="small"
              // Keep Select's value so chips show; dropdown only lists ungiven pages
              value={pages}
              onChange={handlePagesChange}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {(selected as string[]).map((p) => (
                    <Chip
                      key={p}
                      label={p}
                      size="small"
                      onDelete={() => handleRemovePage(p)}
                      deleteIcon={<CloseIcon fontSize="small" />}
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                  ))}
                </Box>
              )}
            >
              {availablePagesToShow.length === 0 ? (
                <MenuItem value="" disabled>
                  All pages assigned
                </MenuItem>
              ) : (
                availablePagesToShow.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))
              )}
            </Select>
            <FormHelperText>
              Pages are used for legacy nav checks (optional)
            </FormHelperText>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <InputLabel sx={{ mb: 0.5 }}>Permissions</InputLabel>

            {loadingPerms ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Select
                multiple
                fullWidth
                size="small"
                value={permissions}
                onChange={handlePermissionsChange}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {(selected as string[]).map((p) => (
                      <Chip
                        key={p}
                        label={p}
                        size="small"
                        onDelete={() => handleRemovePermission(p)}
                        deleteIcon={<CloseIcon fontSize="small" />}
                        onMouseDown={(e) => e.stopPropagation()}
                      />
                    ))}
                  </Box>
                )}
              >
                {availablePermissionsToShow.length === 0 ? (
                  <MenuItem value="" disabled>
                    {availablePermissions === null
                      ? "Permissions loading..."
                      : "All permissions assigned"}
                  </MenuItem>
                ) : (
                  availablePermissionsToShow.map((perm) => (
                    <MenuItem key={perm} value={perm}>
                      {perm}
                    </MenuItem>
                  ))
                )}
              </Select>
            )}
            <FormHelperText>
              Select permissions granted to this role. Permissions list is
              loaded from the server.
            </FormHelperText>
          </Grid>

          {error && (
            <Grid size={{ xs: 12 }}>
              <Typography color="error">{error}</Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading || loadingPerms}
          startIcon={loading ? <CircularProgress size={18} /> : undefined}
        >
          {mode === "create" ? "Create role" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageRole;
