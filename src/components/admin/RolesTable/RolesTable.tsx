// src/components/admin/RolesTable/RolesTable.tsx
import React from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DataTable, { type Column, type RowAction } from "../../ui/DataTable";
import type { Role } from "../../../services/roles.service";
import { Avatar, Box, Stack, Typography } from "@mui/material";

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

const RolesTable: React.FC<Props> = ({
  roles,
  loading = false,
  total = 0,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
}) => {
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

  const actions: RowAction<Role>[] = [
    {
      key: "edit",
      label: "Edit",
      icon: <EditIcon />,
      onClick: (r) => onEdit(r),
      color: "primary",
    },
    {
      key: "delete",
      label: "Delete",
      icon: <DeleteIcon />,
      onClick: (r) => onDelete(r),
      color: "error",
      visible: () => true,
    },
  ];

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
