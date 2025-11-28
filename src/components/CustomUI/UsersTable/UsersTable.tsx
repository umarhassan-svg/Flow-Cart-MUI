/* src/components/admin/UsersTable/UsersTable.tsx */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import type { User } from "../../../types/User";
import CustomTable from "../CustomTable/CustomTable";
import type { Column } from "../../../types/TableColumn";
import { Avatar_C } from "../../../utils/helperUserTable";
import { useNavigate } from "react-router-dom";
import "./usertable.css";
export interface UsersTableProps {
  users: User[];
  loading: boolean;
  total: number;
  page: number; // zero-based page
  rowsPerPage: number;
  onPageChange?: (event: unknown, page: number) => void; // parent handler
  onRowsPerPageChange?: (
    e: ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => void;
  onEdit?: (u: User) => void;
  onDelete?: (u: User) => void;
  onSelectionChange?: (selected: Array<string | number>) => void;
  onRowClick?: (row: User, idx: number) => void;

  /* NEW optional callbacks */
  onSearch?: (value: string) => void;
  onCreate?: () => void;
  onRefresh?: () => void;
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
  onSearch,
  onCreate,
  onRefresh,
}: UsersTableProps) {
  const navigate = useNavigate();

  // local page state for CustomTable (1-based)
  const [localPage, setLocalPage] = useState<number>(Math.max(1, page + 1));
  const [localPageSize, setLocalPageSize] = useState<number>(rowsPerPage);

  // header/search state
  const [searchTyping, setSearchTyping] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");

  // keep local page/pageSize in sync when parent changes
  useEffect(() => {
    setLocalPage(Math.max(1, page + 1));
    console.log(localPage);
  }, [page]);

  useEffect(() => {
    setLocalPageSize(rowsPerPage);
  }, [rowsPerPage]);

  // debounce searchTyping and notify parent via onSearch (if provided)
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchValue !== searchTyping) setSearchValue(searchTyping);
      if (typeof onSearch === "function") {
        onSearch(searchTyping.trim());
        // if parent expects page to reset to 0, call onPageChange
        if (onPageChange) {
          try {
            onPageChange(null, 0);
          } catch {
            // ignore if parent signature is different
          }
        }
      }
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTyping]);

  // Build columns and wire up edit/delete handlers via props
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
            else console.log("Edit user:", u);
          },
        },
        {
          key: "delete",
          label: "Delete",
          variant: "danger",
          onClick: (u: User) => {
            if (onDelete) onDelete(u);
            else console.log("Delete user:", u);
          },
        },
      ],
      width: "160px",
      align: "center",
    },
  ];

  // Handler bridging CustomTable's onPageChange (1-based) -> parent (0-based)
  const handleInternalPageChange = (newPage: number, newPageSize: number) => {
    setLocalPage(newPage);
    setLocalPageSize(newPageSize);

    if (onPageChange) {
      try {
        onPageChange(null, Math.max(0, newPage - 1));
      } catch {
        // ignore
      }
    }

    if (newPageSize !== rowsPerPage && onRowsPerPageChange) {
      const syntheticEvent = {
        target: { value: String(newPageSize) },
      } as unknown as ChangeEvent<HTMLSelectElement>;
      onRowsPerPageChange(syntheticEvent);
    }
  };

  const handleCreateClick = () => {
    if (onCreate) onCreate();
    else navigate("/admin/users/create");
  };

  const handleRefresh = () => {
    if (onRefresh) onRefresh();
    else if (onPageChange) {
      try {
        onPageChange(null, page); // re-trigger parent load for current page
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="users-table-root">
      {/* Header & controls (plain divs, no MUI) */}
      <div className="users-table-header">
        <div className="users-table-title">
          <div className="title-main">User Management</div>
          <div className="title-sub">
            Create and manage users, roles, and access
          </div>
        </div>

        <div className="users-table-controls">
          <div className="search-wrapper">
            <input
              type="search"
              className="search-input"
              placeholder="Search users by name or email..."
              value={searchTyping}
              onChange={(e) => setSearchTyping(e.target.value)}
              aria-label="Search users"
            />
            {searchTyping && (
              <button
                type="button"
                className="search-clear"
                aria-label="Clear search"
                onClick={() => {
                  setSearchTyping("");
                  if (onSearch) onSearch("");
                }}
              >
                ✕
              </button>
            )}
          </div>

          <div className="actions-right">
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleRefresh}
              aria-label="Refresh"
            >
              Refresh
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreateClick}
              aria-label="Add user"
            >
              + Add user
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="users-table-body">
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
    </div>
  );
}
