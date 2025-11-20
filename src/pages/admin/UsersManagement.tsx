/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/UsersManagement.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, useMatch } from "react-router-dom";
import Grid from "@mui/material/Grid";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";

import ManageUser from "../../components/admin/ManageUser/ManageUser";
import UsersTable from "../../components/admin/UsersTable/UsersTable";

import usersService from "../../services/users.service";
import type { User } from "../../types/User";
import type { Role } from "../../services/users.service";
import LayoutMain from "../../components/layout/layoutMain";
import { useAuth } from "../../context/AuthContext";

const UsersManagement = () => {
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const matchCreate = useMatch("/admin/users/create");
  const matchEdit = useMatch("/admin/users/:id/edit");

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

  // dialog control for ManageUser (still kept, but now route-driven)
  const [manageOpen, setManageOpen] = useState(false);
  const [manageMode, setManageMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<User | null>(null);

  // delete dialog
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { can } = useAuth();

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

  // Route-driven modal open/close logic:
  useEffect(() => {
    let mounted = true;

    const openCreateModal = () => {
      if (!mounted) return;
      setEditing(null);
      setManageMode("create");
      setManageOpen(true);
    };

    const openEditModal = async (id: string) => {
      if (!mounted) return;
      setManageMode("edit");
      setManageOpen(true);

      // Try find user in currently loaded list first
      const found = users.find((u) => u.id === id);
      if (found) {
        setEditing(found);
        return;
      }

      // Otherwise fetch single user (service should support getUser)
      try {
        const u = await usersService.getUser(id);
        if (!mounted) return;
        setEditing(u);
      } catch (err: any) {
        console.error("Failed to load user for edit:", err);
        // show snackbar and navigate back to list
        if (mounted) {
          setSnackbar({ open: true, message: "Failed to load user" });
          navigate("/admin/users", { replace: true });
        }
      }
    };

    // open/close based on matched routes
    if (matchCreate) {
      openCreateModal();
    } else if (matchEdit && params.id) {
      openEditModal(params.id);
    } else {
      // no create/edit route active -> ensure modal closed and state reset
      setManageOpen(false);
      setEditing(null);
      setManageMode("create");
    }

    return () => {
      mounted = false;
    };
    // include users so edit will pick a freshly loaded user if available
  }, [matchCreate, matchEdit, params.id, users, navigate]);

  // Handlers now navigate to route (route will open dialog)
  const openCreate = () => {
    navigate("/admin/users/create");
  };

  const openEdit = (u: User) => {
    navigate(`/admin/users/${u.id}/edit`);
  };

  const handleManageSaved = async (msg?: string) => {
    await loadUsers();
    // close modal by navigating back to list route
    navigate("/admin/users", { replace: true });
    setSnackbar({
      open: true,
      message:
        msg || (manageMode === "create" ? "User created" : "User updated"),
    });
  };

  const handleManageClose = () => {
    // close modal by navigating back
    navigate("/admin/users", { replace: true });
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
          {/* Page header with Add button in upper-right */}
          <Grid size={{ xs: 12 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{
                    fontSize: {
                      xs: "1.25rem", // extra-small screens (mobile)
                      sm: "1.5rem", // small screens
                      md: "1.75rem", // medium screens
                      lg: "2rem", // large screens
                    },
                  }}
                >
                  User Management
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Create and manage users. Assign roles and control access to
                  pages.
                </Typography>
              </Box>
              {can("roles:create") && (
                <Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openCreate}
                    size="small"
                  >
                    Add user
                  </Button>
                </Box>
              )}
            </Stack>
          </Grid>

          {/* Right column: search + table */}
          <Grid size={{ xs: 12 }}>
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
                    sx={{ minWidth: 0 }}
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
                onEdit={(u) => openEdit(u)}
                onDelete={(u) => handleDeleteConfirm(u)}
              />
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* ManageUser dialog (create / edit) - opened via route */}
      <ManageUser
        open={manageOpen}
        mode={manageMode}
        roles={roles}
        initialUser={editing ?? undefined}
        onClose={handleManageClose}
        onSaved={() => handleManageSaved()}
      />

      {/* Delete confirmation */}
      {can("roles:delete") && (
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
      )}

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
