// src/pages/RolesManagement.tsx
import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputLabel,
  Select,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";

import AddNewRole from "../../components/admin/AddNewRole/AddNewRole";
import RolesTable from "../../components/admin/RolesTable/RolesTable";

import rolesService from "../../services/roles.service";
import type { Role } from "../../services/roles.service";
import LayoutMain from "../../components/layout/layoutMain";

const RolesManagement: React.FC = () => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [searchTyping, setSearchTyping] = useState("");
  const [search, setSearch] = useState("");

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  // edit dialog state
  const [editing, setEditing] = useState<Role | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // delete state
  const [toDelete, setToDelete] = useState<Role | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // debounce searchTyping -> search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchTyping.trim());
      setPage(0);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTyping]);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const list = await rolesService.getRoles();
      // client-side search & pagination (API returns all roles)
      const filtered = search
        ? list.filter(
            (r) =>
              r.name.toLowerCase().includes(search.toLowerCase()) ||
              (r.pages || []).some((p) =>
                p.toLowerCase().includes(search.toLowerCase())
              )
          )
        : list;

      setTotal(filtered.length);
      const start = page * limit;
      setRoles(filtered.slice(start, start + limit));
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error)
        setSnackbar({
          open: true,
          message: err?.message || "Failed to load roles",
        });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search]);

  useEffect(() => {
    // warm-up load for left panel suggestions (non-blocking)
    (async () => {
      try {
        await rolesService.getRoles();
      } catch {
        // ignore
      }
    })();
  }, []);

  const handleCreated = async () => {
    setPage(0);
    await loadRoles();
    setSnackbar({ open: true, message: "Role created" });
  };

  const handleEdit = (r: Role) => {
    setEditing(r);
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editing) return;
    try {
      await rolesService.updateRole(editing.id, {
        name: editing.name,
        pages: editing.pages,
      });
      setEditOpen(false);
      setEditing(null);
      await loadRoles();
      setSnackbar({ open: true, message: "Role updated" });
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error)
        setSnackbar({ open: true, message: err?.message || "Update failed" });
    }
  };

  const confirmDelete = (r: Role) => {
    setToDelete(r);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await rolesService.deleteRole(toDelete.id);
      setDeleteOpen(false);
      setToDelete(null);
      await loadRoles();
      setSnackbar({ open: true, message: "Role deleted" });
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error)
        setSnackbar({ open: true, message: err?.message || "Delete failed" });
    }
  };

  return (
    <LayoutMain>
      <Box p={{ xs: 2, md: 3 }}>
        <Grid container spacing={3}>
          {/* Header */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h5" fontWeight={700}>
              Roles Management
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Create and manage roles. Assign pages to control access.
            </Typography>
          </Grid>

          {/* Left column: AddNewRole (sticky on md+) */}
          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{
              position: isMdUp ? "sticky" : "relative",
              top: isMdUp ? { md: "64px" } : "auto",
              alignSelf: "flex-start",
            }}
          >
            <Box sx={{ mb: { xs: 2, md: 0 } }}>
              <AddNewRole onCreated={handleCreated} />
            </Box>
          </Grid>

          {/* Right column: search + table */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={2}>
              <Paper
                sx={{
                  p: 2,
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search roles or pages..."
                    fullWidth
                    value={searchTyping}
                    onChange={(e) => setSearchTyping(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: search ? (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSearchTyping("");
                              setSearch("");
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ) : undefined,
                    }}
                    sx={{ minWidth: 0 }}
                  />
                </Box>

                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => loadRoles()}
                  >
                    Refresh
                  </Button>
                </Box>
              </Paper>

              <RolesTable
                roles={roles}
                loading={loading}
                total={total}
                page={page}
                rowsPerPage={limit}
                onPageChange={(_, p) => setPage(p)}
                onRowsPerPageChange={(e) => {
                  setLimit(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                onEdit={(r) => handleEdit(r)}
                onDelete={(r) => confirmDelete(r)}
              />
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Edit role dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <EditIcon />
            <span>Edit Role</span>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {editing ? (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Role name"
                  size="small"
                  fullWidth
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <InputLabel sx={{ mb: 0.5 }}>Pages</InputLabel>
                <Select
                  multiple
                  fullWidth
                  size="small"
                  value={editing.pages}
                  onChange={(e) => {
                    const val = e.target.value as string[];
                    setEditing({ ...editing, pages: val });
                  }}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {(selected as string[]).map((r) => (
                        <Chip key={r} label={r} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {["dashboard", "users", "roles", "products", "orders"].map(
                    //replace with all pages
                    (p) => (
                      <MenuItem key={p} value={p}>
                        {p}
                      </MenuItem>
                    )
                  )}
                </Select>
              </Grid>
            </Grid>
          ) : (
            <Typography>Loading...</Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete role</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Are you sure you want to delete <strong>{toDelete?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        onClose={() => setSnackbar({ open: false, message: "" })}
        autoHideDuration={3000}
        message={snackbar.message}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setSnackbar({ open: false, message: "" })}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </LayoutMain>
  );
};

export default RolesManagement;
