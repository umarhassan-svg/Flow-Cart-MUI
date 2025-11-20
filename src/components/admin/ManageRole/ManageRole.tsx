// src/components/admin/ManageRole/ManageRole.tsx
import React, { useEffect, useMemo, useState } from "react";
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
  TextField,
  Typography,
  FormHelperText,
  IconButton,
  Stack,
  Checkbox,
  FormControlLabel,
  Grid,
  Divider,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import rolesService from "../../../services/roles.service";
import type { Role } from "../../../types/Roles";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initialRole?: Role;
  onClose: () => void;
  onSaved?: () => void;
};

const ManageRole = ({ open, mode, initialRole, onClose, onSaved }: Props) => {
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

  // small filter for permissions (helps find permission in long lists)
  const [permFilter, setPermFilter] = useState("");

  // load permissions (admin's master permissions list) when dialog opens
  useEffect(() => {
    let mounted = true;
    const loadPerms = async () => {
      setLoadingPerms(true);
      try {
        const perms = await rolesService.getPermissions();
        if (!mounted) return;
        setAvailablePermissions(perms ?? []);
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
    setPermFilter("");
  }, [initialRole, open]);

  const allPages = ["dashboard", "users", "roles", "products", "orders"]; // replace or load dynamically

  const availablePagesToShow = allPages.filter((p) => !pages.includes(p));

  // group permissions by prefix (before ':'). fallback group = 'other'
  const groupedPermissions = useMemo(() => {
    const map = new Map<string, string[]>();
    (availablePermissions ?? []).forEach((p) => {
      const name = String(p);
      const idx = name.indexOf(":");
      const category = idx !== -1 ? name.slice(0, idx) : "other";
      if (!map.has(category)) map.set(category, []);
      map.get(category)!.push(name);
    });

    // sort keys for deterministic order and sort permissions in each category
    return Array.from(map.entries())
      .map(([k, v]) => [k, v.sort()] as [string, string[]])
      .sort((a, b) => a[0].localeCompare(b[0]));
  }, [availablePermissions]);

  // apply small text filter (search) to permissions list
  const filteredGroupedPermissions = useMemo(() => {
    if (!permFilter.trim()) return groupedPermissions;
    const q = permFilter.trim().toLowerCase();
    return groupedPermissions
      .map(
        ([cat, perms]) =>
          [cat, perms.filter((p) => p.toLowerCase().includes(q))] as [
            string,
            string[]
          ]
      )
      .filter(([, perms]) => perms.length > 0);
  }, [groupedPermissions, permFilter]);

  // handlers
  const togglePermission = (perm: string) => {
    setPermissions((prev) => {
      if (prev.includes(perm)) return prev.filter((p) => p !== perm);
      return [...prev, perm].sort();
    });
  };

  const handleRemovePermission = (perm: string) => {
    setPermissions((prev) => prev.filter((p) => p !== perm));
  };

  const selectCategory = (categoryPerms: string[]) => {
    // add all perms in this category (keep unique)
    setPermissions((prev) => {
      const set = new Set(prev);
      categoryPerms.forEach((p) => set.add(p));
      return Array.from(set).sort();
    });
  };

  const clearCategory = (categoryPerms: string[]) => {
    setPermissions((prev) => prev.filter((p) => !categoryPerms.includes(p)));
  };

  const handlePagesChange = (e: unknown) => {
    const val = e as string | React.ChangeEvent<HTMLSelectElement>;
    if (typeof val === "string") setPages(val.split(","));
    else
      setPages(
        (val as React.ChangeEvent<HTMLSelectElement>).target
          .value as unknown as string[]
      );
  };

  const handleRemovePage = (pg: string) => {
    setPages((prev) => prev.filter((p) => p !== pg));
  };

  const resetForm = () => {
    setName("");
    setPages([]);
    setPermissions([]);
    setPermFilter("");
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          {mode === "create" ? <AddCircleOutlineIcon /> : <EditIcon />}
          <span>{mode === "create" ? "Create Role" : "Edit Role"}</span>
        </Box>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          maxHeight: "50vh",
          overflowY: "auto",
        }}
      >
        <Stack spacing={2}>
          <Box>
            <TextField
              label="Role name"
              size="small"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Box>

          <Box>
            <InputLabel sx={{ mb: 0.5 }}>Pages</InputLabel>
            <TextField
              select
              SelectProps={{
                native: false,
                multiple: true,
                value: pages,
                onChange: handlePagesChange,
                renderValue: (selected: unknown) => (
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
                ),
              }}
              fullWidth
              size="small"
            >
              {availablePagesToShow.length === 0 ? (
                <option value="" disabled>
                  All pages assigned
                </option>
              ) : (
                availablePagesToShow.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))
              )}
            </TextField>
            <FormHelperText>
              Pages are used for legacy nav checks (optional)
            </FormHelperText>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <InputLabel sx={{ mb: 0 }}>Permissions</InputLabel>
              <TextField
                size="small"
                placeholder="Filter permissions..."
                value={permFilter}
                onChange={(e) => setPermFilter(e.target.value)}
                sx={{ ml: 2, width: 260 }}
              />
            </Stack>

            {loadingPerms ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress />
              </Box>
            ) : (availablePermissions ?? []).length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {availablePermissions === null
                  ? "Permissions loading..."
                  : "No permissions available"}
              </Typography>
            ) : (
              // categories container
              <Box sx={{ display: "grid", gap: 2 }}>
                {filteredGroupedPermissions.map(([category, perms]) => (
                  <Box
                    key={category}
                    sx={{
                      border: "1px solid rgba(0,0,0,0.04)",
                      p: 1,
                      borderRadius: 1,
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ textTransform: "capitalize" }}
                      >
                        {category}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton
                          size="small"
                          aria-label={`select all ${category}`}
                          onClick={() => selectCategory(perms)}
                          title="Select all"
                        >
                          <SelectAllIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          aria-label={`clear ${category}`}
                          onClick={() => clearCategory(perms)}
                          title="Clear"
                        >
                          <ClearAllIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>

                    {/* permission checklist: two columns */}
                    <Box sx={{ maxHeight: 220, overflow: "auto", pr: 1 }}>
                      <Grid container spacing={0.5}>
                        {perms.map((perm) => (
                          <Grid key={perm} size={{ xs: 6, sm: 4 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={permissions.includes(perm)}
                                  onChange={() => togglePermission(perm)}
                                  size="small"
                                  inputProps={{ "aria-label": perm }}
                                />
                              }
                              label={
                                <Typography variant="body2">{perm}</Typography>
                              }
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
            <FormHelperText sx={{ mt: 1 }}>
              Assign permissions grouped by category. Use filter to find a
              permission quickly.
            </FormHelperText>

            {/* selected chips */}
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 1 }}>
              {permissions.map((p) => (
                <Chip
                  key={p}
                  label={p}
                  size="small"
                  onDelete={() => handleRemovePermission(p)}
                  deleteIcon={<CloseIcon fontSize="small" />}
                />
              ))}
            </Box>
          </Box>

          {error && (
            <Box>
              <Typography color="error">{error}</Typography>
            </Box>
          )}
        </Stack>
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
