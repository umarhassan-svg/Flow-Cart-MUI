/* src/components/admin/RolesTable/RolesTable.tsx */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import type { Role } from "../../../types/Roles";
import CustomTable from "../CustomTable/CustomTable";
import type { Column } from "../../../types/TableColumn";
import { useNavigate } from "react-router-dom";
import "./rolestable.css";
import { useAuth } from "../../../context/AuthContext";
import { FaEdit, FaTrash } from "react-icons/fa";

export interface RolesTableProps {
  roles: Role[];
  loading: boolean;
  total: number;
  page: number; // zero-based
  rowsPerPage: number;
  onPageChange?: (event: unknown, page: number) => void;
  onRowsPerPageChange?: (
    e: ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => void;
  onEdit?: (r: Role) => void;
  onDelete?: (r: Role) => void;
  onSelectionChange?: (selected: Array<string | number>) => void;
  onRowClick?: (row: Role, idx: number) => void;

  /* optional callbacks */
  onSearch?: (value: string) => void;
  onCreate?: () => void;
  onRefresh?: () => void;
}

export default function RolesTable({
  roles,
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
}: RolesTableProps) {
  const navigate = useNavigate();

  // local page state for CustomTable (1-based)
  const [localPage, setLocalPage] = useState<number>(Math.max(1, page + 1));
  const [localPageSize, setLocalPageSize] = useState<number>(rowsPerPage);

  // header/search state
  const [searchTyping, setSearchTyping] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");

  useEffect(() => {
    setLocalPage(Math.max(1, page + 1));
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
        if (onPageChange) {
          try {
            onPageChange(null, 0);
          } catch {
            // ignore
          }
        }
      }
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTyping]);

  const { can } = useAuth();

  const actions = useMemo(() => {
    const a: {
      key: string;
      label: string;
      variant: "primary" | "default" | "danger" | "ghost";
      onClick: (o: Role) => void;
      icon?: React.ReactNode;
    }[] = [];
    if (can("roles:create")) {
      a.push({
        key: "edit",
        label: "Edit",
        variant: "default",
        onClick: (r: Role) => {
          if (onEdit) onEdit(r);
          else navigate(`/admin/roles/${r.id}/edit`);
        },
        icon: <FaEdit />,
      });
    }
    if (can("roles:delete")) {
      a.push({
        key: "delete",
        label: "Delete",
        variant: "danger",
        onClick: (r: Role) => {
          if (onDelete) onDelete(r);
          else navigate(`/admin/roles/${r.id}/delete`);
        },
        icon: <FaTrash />,
      });
    }
    return a;
  }, [can, onEdit, onDelete, navigate]);
  // Build columns for roles
  const columns: Column<Role>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Role",
        accessor: (r: Role) => r.name,
        render: (r: Role) => <strong style={{ fontSize: 14 }}>{r.name}</strong>,
        width: "260px",
      },
      {
        id: "pages",
        header: "Pages",
        accessor: (r: Role) => r.pages,
        type: "chips",
        width: "300px",
      },
      {
        id: "permissions",
        header: "Permissions",
        accessor: (r: Role) => r.permissions ?? [],
        type: "chips",
        width: "300px",
      },
      {
        id: "actions",
        header: "Actions",
        type: "buttons",
        options: actions,

        width: "160px",
        align: "center",
      },
    ],
    [actions]
  );

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
    else navigate("/admin/roles/create");
  };

  const handleRefresh = () => {
    if (onRefresh) onRefresh();
    else if (onPageChange) {
      try {
        onPageChange(null, page); // re-trigger parent load
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="roles-table-root">
      {/* Header & controls (plain divs) */}
      <div className="roles-table-header">
        <div className="roles-table-title">
          <div className="title-main">Roles Management</div>
          <div className="title-sub">
            Create and manage roles, pages, and permissions
          </div>
        </div>

        <div className="roles-table-controls">
          <div className="search-wrapper">
            <input
              type="search"
              className="search-input"
              placeholder="Search roles, pages or permissions..."
              value={searchTyping}
              onChange={(e) => setSearchTyping(e.target.value)}
              aria-label="Search roles"
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

            {can("roles:create") && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCreateClick}
                aria-label="Add user"
              >
                + Add user
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="roles-table-body">
        <CustomTable<Role>
          columns={columns}
          data={roles}
          pagination
          loading={loading}
          total={total}
          rowKey="id"
          dense
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
