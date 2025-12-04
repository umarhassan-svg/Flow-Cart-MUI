/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/RolesManagement.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useMatch } from "react-router-dom";
import { IconButton, Snackbar } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import ManageRole from "../../components/admin/ManageRole/ManageRole";
import RolesTable from "../../components/CustomUI/RolesTable/RolesTable";

import rolesService from "../../services/roles.service";
import type { Role } from "../../types/Roles";
import LayoutMain from "../../components/layout/layoutMain";
import { useAuth } from "../../context/AuthContext";
import MessageDialogBox from "../../components/CustomUI/MessageDialogBox/MessageDialogBox";
import type {
  DialogAction,
  DialogVariant,
} from "../../types/MessageDialogBoxTypes";

const RolesManagement = () => {
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const matchCreate = useMatch("/admin/roles/create");
  const matchEdit = useMatch("/admin/roles/:id/edit");

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

  // Route-driven ManageRole dialog state
  const [manageOpen, setManageOpen] = useState(false);
  const [manageMode, setManageMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Role | null>(null);

  // delete dialog
  const [toDelete, setToDelete] = useState<Role | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { can } = useAuth();

  // debounce searchTyping -> search (kept but RolesTable also debounces;
  // parent uses onSearch to receive final value)
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
      const filtered = search
        ? list.filter(
            (r) =>
              r.name.toLowerCase().includes(search.toLowerCase()) ||
              (r.pages || []).some((p) =>
                p.toLowerCase().includes(search.toLowerCase())
              ) ||
              (r.permissions || []).some((perm) =>
                perm.toLowerCase().includes(search.toLowerCase())
              )
          )
        : list;

      setTotal(filtered.length);
      const start = page * limit;
      setRoles(filtered.slice(start, start + limit));
    } catch (err: unknown) {
      console.error(err);
      setSnackbar({
        open: true,
        message: (err as Error)?.message || "Failed to load roles",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search]);

  // Route-driven modal open/close logic (mirrors UsersManagement)
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

      // Try find role in currently loaded list first
      const found = roles.find((r) => r.id === id);
      if (found) {
        setEditing(found);
        return;
      }

      // Otherwise fetch single role
      try {
        const r = await rolesService.getRole(id);
        if (!mounted) return;
        setEditing(r);
      } catch (err: any) {
        console.error("Failed to load role for edit:", err);
        if (mounted) {
          setSnackbar({ open: true, message: "Failed to load role" });
          navigate("/admin/roles", { replace: true });
        }
      }
    };

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
  }, [matchCreate, matchEdit, params.id, roles, navigate]);

  // handlers that navigate to route (route opens modal)
  const openCreate = () => {
    navigate("/admin/roles/create");
  };

  const openEdit = (r: Role) => {
    navigate(`/admin/roles/${r.id}/edit`);
  };

  const handleManageSaved = async (msg?: string) => {
    await loadRoles();
    // close modal by navigating back to list route
    navigate("/admin/roles", { replace: true });
    setSnackbar({
      open: true,
      message:
        msg || (manageMode === "create" ? "Role created" : "Role updated"),
    });
  };

  const handleManageClose = () => {
    navigate("/admin/roles", { replace: true });
  };

  const handleDeleteConfirm = (r: Role) => {
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
    } catch (err: any) {
      console.error(err);
      setSnackbar({
        open: true,
        message: (err as Error)?.message || "Delete failed",
      });
    }
  };
  const deleteactions: DialogAction[] = useMemo(() => {
    return [
      {
        key: "cancel",
        label: "Cancel",
        // MessageDialogBox will call onClose after this action, so this can be a no-op
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
          /* no-op */
          e.stopPropagation();
        },
        isPrimary: false,
      },
      {
        key: "delete",
        label: "Delete",
        onClick: async () => {
          await handleDelete();
        },

        isPrimary: true,
      },
    ];
  }, []);

  return (
    <LayoutMain>
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
        onEdit={(r) => openEdit(r)}
        onDelete={(r) => handleDeleteConfirm(r)}
        onSearch={(q) => {
          setSearch(q);
          setPage(0);
        }}
        onCreate={() => openCreate()}
        onRefresh={() => loadRoles()}
      />
      {/* ManageRole dialog (create / edit) - opened via route */}
      <ManageRole
        open={manageOpen}
        mode={manageMode}
        initialRole={editing ?? undefined}
        onClose={handleManageClose}
        onSaved={() => handleManageSaved()}
      />

      {/* Delete confirmation */}
      {can("users:delete") && (
        <MessageDialogBox
          isOpen={deleteOpen} // local state controls visibility
          onClose={() => setDeleteOpen(false)}
          maintext={"Are you sure you want to delete " + toDelete?.name + "?"}
          message="This cannot be undone."
          actions={deleteactions}
          variant={"warning" as DialogVariant}
        />
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

export default RolesManagement;
