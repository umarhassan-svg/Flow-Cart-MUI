import LayoutMain from "../../components/layout/layoutMain";
import UsersTable from "../../components/CustomUI/UsersTable/UsersTable";
import { useMatch, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { User } from "../../types/User";
import type { Role } from "../../types/Roles";
import { useAuth } from "../../context/AuthContext";
import usersService from "../../services/users.service";
import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Typography,
} from "@mui/material";
import ManageUser from "../../components/admin/ManageUser/ManageUser";

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

  const [searchTyping] = useState("");
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
    } catch (err: unknown) {
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
    } catch (err: unknown) {
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
      } catch (err: unknown) {
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
    } catch (err: unknown) {
      console.error(err);
      setSnackbar({ open: true, message: "Delete failed" });
    }
  };

  return (
    <LayoutMain>
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
        onSearch={(q) => {
          setSearch(q); // add `search` state in UsersManagement (if not already)
          setPage(0);
        }}
        onCreate={() => openCreate()} // optional: will call parent openCreate
        onRefresh={() => loadUsers()} // optional
      />

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
      {can("users:delete") && (
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
