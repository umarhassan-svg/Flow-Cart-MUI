import React from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DataTable, { type Column, type RowAction } from "../../ui/DataTable";
import type { User } from "../../../services/auth.service";

type Props = {
  users: User[];
  loading?: boolean;
  total: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, page: number) => void;
  onRowsPerPageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEdit?: (u: User) => void;
  onDelete?: (u: User) => void;
};

const UsersTable: React.FC<Props> = (props) => {
  const columns: Column<User>[] = [
    { field: "name", label: "User", accessor: "name" },
    { field: "email", label: "Email", accessor: "email" },
    { field: "roles", label: "Roles", accessor: "roles" },
  ];

  const actions: RowAction<User>[] = [
    {
      key: "edit",
      label: "Edit",
      icon: <EditIcon />,
      onClick: (r) => props.onEdit?.(r),
      color: "primary",
    },
    {
      key: "delete",
      label: "Delete",
      icon: <DeleteIcon />,
      onClick: (r) => props.onDelete?.(r),
      color: "error",
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={props.users}
      loading={props.loading}
      total={props.total}
      page={props.page}
      rowsPerPage={props.rowsPerPage}
      onPageChange={props.onPageChange}
      onRowsPerPageChange={props.onRowsPerPageChange}
      actions={actions}
      rowKey="id"
    />
  );
};

export default UsersTable;
