// src/components/admin/RolesTable/RolesTable.tsx
import React from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DataTable, { type Column, type RowAction } from "../../ui/DataTable";
import type { Role } from "../../../types/Roles";
import { Avatar, Box, Stack, Typography } from "@mui/material";
import { useAuth } from "../../../context/AuthContext";

type Props = {
  roles: Role[];
  loading?: boolean;
  total?: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (e: unknown, p: number) => void;
  onRowsPerPageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEdit: (r: Role) => void;
  onDelete: (r: Role) => void;
};

const RolesTable = ({
  roles,
  loading = false,
  total = 0,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
}: Props) => {
  const { can } = useAuth();
  // columns
  const columns: Column<Role>[] = [
    {
      field: "name",
      label: "Role",
      accessor: "name",
      render: (r) => (
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: (theme) => theme.palette.primary.main }}>
            {r.name ? r.name.charAt(0).toUpperCase() : "R"}
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 600 }}>{r.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {r.id}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: "pages",
      label: "Pages",
      accessor: "pages",
      // leave render to DataTable's default (array -> chips)
    },
    {
      field: "permissions",
      label: "Permissions",
      accessor: "permissions",
      render: (r) =>
        r.permissions && r.permissions.length ? r.permissions : ["—"], // DataTable will render arrays as chips
    },
  ];

  // actions

  const actions: RowAction<Role>[] = [];

  if (can("roles:delete")) {
    actions.push({
      key: "delete",
      label: "Delete",
      icon: <DeleteIcon />,
      onClick: (r) => onDelete(r),
      color: "error",
      visible: () => true,
    });
  }
  if (can("roles:edit")) {
    actions.push({
      key: "edit",
      label: "Edit",
      icon: <EditIcon />,
      onClick: (r) => onEdit(r),
      color: "primary",
    });
  }

  return (
    <DataTable
      columns={columns}
      rows={roles}
      loading={loading}
      total={total ?? roles.length}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      actions={actions}
      rowKey="id"
      emptyMessage="No roles found."
    />
  );
};

export default RolesTable;
