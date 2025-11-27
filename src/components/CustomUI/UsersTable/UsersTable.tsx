/* eslint-disable @typescript-eslint/no-unused-vars */
/* src/components/admin/UsersTable/UsersTable.tsx */
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import type { User } from "../../../types/User";
import CustomTable from "../CustomTable/CustomTable";
import type { Column } from "../../../types/TableColumn";
import { Avatar_C } from "../../../utils/helperUserTable";

/** Props expected by the wrapper in UsersManagement.tsx */
export interface UsersTableProps {
  users: User[];
  loading: boolean;
  total: number;
  page: number; // zero-based page (matches your UsersManagement)
  rowsPerPage: number;
  onPageChange?: (event: unknown, page: number) => void; // (event, page) like MUI
  onRowsPerPageChange?: (
    e: ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => void;
  onEdit?: (u: User) => void;
  onDelete?: (u: User) => void;
  onSelectionChange?: (selected: Array<string | number>) => void;
  onRowClick?: (row: User, idx: number) => void;
}

export default function UsersTable({
  users,
  loading,
  total,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onSelectionChange,
  onRowClick,
}: UsersTableProps) {
  // local page state for CustomTable (1-based) — keep in sync with parent page (0-based)
  const [localPage, setLocalPage] = useState<number>(Math.max(1, page + 1));
  const [localPageSize, setLocalPageSize] = useState<number>(rowsPerPage);

  // keep local page/pageSize in sync when parent changes
  useEffect(() => {
    setLocalPage(Math.max(1, page + 1));
  }, [page]);

  useEffect(() => {
    setLocalPageSize(rowsPerPage);
  }, [rowsPerPage]);

  // Build columns here so we can reference onEdit/onDelete handlers
  const columns: Column<User>[] = [
    {
      id: "profile",
      header: "User",
      render: (u: User) => (
        <Avatar_C src={u.profilePicturePath} name={u.name} />
      ),
      width: "280px",
    },
    {
      id: "email",
      header: "Email",
      accessor: (u: User) => u.email,
      width: "260px",
      render: (u: User) => (
        <span style={{ color: "#6b7280", fontSize: 14 }}>{u.email}</span>
      ),
    },
    {
      id: "roles",
      header: "Roles",
      accessor: (u: User) => u.roles,
      type: "chips",
      width: "220px",
    },
    {
      id: "permissions",
      header: "Permissions",
      accessor: (u: User) => u.effectivePermissions,
      type: "chips",
      width: "200px",
    },
    {
      id: "actions",
      header: "Actions",
      type: "buttons",
      options: [
        {
          key: "edit",
          label: "Edit",
          variant: "primary",
          onClick: (u: User) => {
            if (onEdit) onEdit(u);
            else {
              // fallback: no-op or open new tab
              // window.location.href = `/admin/users/${u.id}/edit`;
              // keep no-op so lint remains happy
            }
          },
        },
        {
          key: "delete",
          label: "Delete",
          variant: "danger",
          onClick: (u: User) => {
            if (onDelete) onDelete(u);
            else {
              /* fallback no-op */
            }
          },
        },
      ],
      width: "160px",
      align: "center",
    },
  ];

  // Handler bridging CustomTable's onPageChange (page:1-based, pageSize) -> parent (0-based)
  const handleInternalPageChange = (newPage: number, newPageSize: number) => {
    // update local state
    setLocalPage(newPage);
    setLocalPageSize(newPageSize);

    // call parent page change with zero-based page
    if (onPageChange) {
      try {
        // parent expects signature (event, page) — we don't have an event here
        onPageChange(null, Math.max(0, newPage - 1));
      } catch {
        // swallow if parent's signature differs
      }
    }

    // if pageSize changed, synthesize an event for onRowsPerPageChange
    if (newPageSize !== rowsPerPage && onRowsPerPageChange) {
      const syntheticEvent = {
        target: { value: String(newPageSize) },
      } as unknown as ChangeEvent<HTMLSelectElement>;
      onRowsPerPageChange(syntheticEvent);
    }
  };

  return (
    <div>
      <CustomTable<User>
        columns={columns}
        data={users}
        pagination
        loading={loading}
        total={total}
        rowKey="id"
        onSelectionChange={onSelectionChange}
        onRowClick={onRowClick}
        serverSide
        onPageChange={(p: number, ps: number) =>
          handleInternalPageChange(p, ps)
        }
        initialPageSize={localPageSize}
        pageSizeOptions={[2, 5, 10, 25, 50]}
      />
    </div>
  );
}
