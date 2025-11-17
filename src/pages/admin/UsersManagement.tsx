/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/UsersManagement.tsx
import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  InputLabel,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";

import AddNewUser from "../../components/admin/AddNewUser/AddNewUser";
import UsersTable from "../../components/admin/UsersTable/UsersTable";

import usersService from "../../services/users.service";
import type { User } from "../../services/auth.service";
import type { Role, UpdateUserPayload } from "../../services/users.service";
import LayoutMain from "../../components/layout/layoutMain";

const UsersManagement = () => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0); // zero based
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [searchTyping, setSearchTyping] = useState("");
  const [search, setSearch] = useState("");

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  // edit dialog
  const [editing, setEditing] = useState<User | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
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
    try {
      const r = await usersService.getRoles();
      setRoles(r);
    } catch (err: any) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to load roles" });
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const resp = await usersService.getUsers({
        page: page + 1,
        limit,
        search,
      });
      setUsers(resp.data);
      setTotal(resp.total);
    } catch (err: any) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to load users" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search]);

  const handleCreated = async () => {
    await loadUsers();
    setSnackbar({ open: true, message: "User created" });
  };

  const handleEdit = (u: User) => {
    setEditing(u);
    setEditOpen(true);
  };

  const handleEditSave = async (payload: Partial<User>) => {
    if (!editing) return;
    try {
      const updatePayload: UpdateUserPayload = {
        name: payload.name,
        email: payload.email,
        roles: payload.roles,
      };
      await usersService.updateUser(editing.id, updatePayload);
      await loadUsers();
      setEditOpen(false);
      setEditing(null);
      setSnackbar({ open: true, message: "User updated" });
    } catch (err: any) {
      console.error(err);
      setSnackbar({ open: true, message: "Update failed" });
    }
  };

  const handleDeleteConfirm = (u: User) => {
    setDeleteTarget(u);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await usersService.deleteUser(deleteTarget.id);
      setDeleteOpen(false);
      setDeleteTarget(null);
      await loadUsers();
      setSnackbar({ open: true, message: "User deleted" });
    } catch (err: any) {
      console.error(err);
      setSnackbar({ open: true, message: "Delete failed" });
    }
  };

  return (
    <LayoutMain>
      <Box p={{ xs: 2, md: 3 }}>
        <Grid container spacing={3}>
          {/* Page header */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h5" fontWeight={700}>
              User Management
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Create and manage users. Assign roles and control access to pages.
            </Typography>
          </Grid>

          {/* Left column: AddNewUser */}
          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{
              position: isMdUp ? "sticky" : "relative",
              top: isMdUp ? { md: "64px", xs: "56px" } : "auto",
              alignSelf: "flex-start",
            }}
          >
            <Box sx={{ mb: { xs: 2, md: 0 } }}>
              <AddNewUser roles={roles} onCreated={handleCreated} />
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
                  // collapse vertically on very small screens
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search users by name or email..."
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
                    sx={{ minWidth: 0 }} // allows flex shrinking
                  />
                </Box>

                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => loadUsers()}
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    Refresh
                  </Button>
                </Box>
              </Paper>

              <UsersTable
                users={users}
                loading={loading}
                total={total}
                page={page}
                rowsPerPage={limit}
                onPageChange={(_, p) => setPage(p)}
                onRowsPerPageChange={(e) => {
                  setLimit(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                onEdit={(u) => handleEdit(u)}
                onDelete={(u) => handleDeleteConfirm(u)}
              />
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Edit dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <EditIcon />
            <span>Edit User</span>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {editing ? (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Full name"
                  size="small"
                  fullWidth
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Email"
                  size="small"
                  fullWidth
                  value={editing.email}
                  onChange={(e) =>
                    setEditing({ ...editing, email: e.target.value })
                  }
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <InputLabel sx={{ mb: 0.5 }}>Roles</InputLabel>
                <Select
                  multiple
                  fullWidth
                  size="small"
                  value={editing.roles}
                  onChange={(e) => {
                    const val = e.target.value as string[];
                    setEditing({ ...editing, roles: val });
                  }}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {(selected as string[]).map((r) => (
                        <Chip key={r} label={r} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {roles.map((r) => (
                    <MenuItem key={r.id} value={r.name}>
                      {r.name}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            </Grid>
          ) : (
            <Typography>Loading...</Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() =>
              handleEditSave({
                name: editing?.name,
                email: editing?.email,
                roles: editing?.roles,
              })
            }
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete user</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>{deleteTarget?.name}</strong>?
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

export default UsersManagement;
