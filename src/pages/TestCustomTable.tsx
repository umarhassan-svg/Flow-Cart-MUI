/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import type { User } from "../types/User";
import CustomTable from "../components/CustomUI/CustomTable/CustomTable";
import type { Column } from "../types/TableColumn";
import LayoutMain from "../components/layout/layoutMain";
import usersService from "../services/users.service";
import { Avatar_C, Chip_C, ActionButton } from "../utils/helperUserTable";

const columns: Column<User>[] = [
  {
    id: "profile",
    header: "User",
    render: (u: User) => <Avatar_C src={u.profilePicturePath} name={u.name} />,
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
    render: (u: User) => (
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {u.roles?.length ? (
          u.roles.map((r, idx) => (
            <Chip_C
              key={r}
              text={r}
              variant={idx === 0 ? "primary" : "default"}
            />
          ))
        ) : (
          <span style={{ color: "#9ca3af", fontSize: 13 }}>—</span>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    render: (u: User) => (
      <div style={{ display: "flex", gap: 6 }}>
        <ActionButton
          label="Edit"
          onClick={(e) => {
            e.stopPropagation();
            console.log("Edit", u.id);
          }}
          variant="primary"
        />
        <ActionButton
          label="Delete"
          onClick={(e) => {
            e.stopPropagation();
            console.log("Delete", u.id);
          }}
          variant="ghost"
        />
      </div>
    ),
    width: "160px",
    align: "center",
  },
];

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1); // pagination is 1-based in CustomTable
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const resp = await usersService.getUsers({
        page,
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
    loadUsers();
  }, [page, limit, search]);

  const handleSelectionChange = (selectedKeys: Array<string | number>) => {
    console.log("Selection changed:", selectedKeys);
  };

  const handleRowClick = (row: User, idx: number) => {
    console.log("Row clicked:", row.name, "at index", idx);
  };

  return (
    <LayoutMain>
      <div style={{ padding: "20px" }}>
        <div style={{ marginBottom: "24px" }}>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            Users Management
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280" }}>
            Manage user accounts, roles, and permissions
          </p>
        </div>

        <CustomTable<User>
          columns={columns}
          data={users}
          pagination
          loading={loading}
          total={total}
          rowKey="id"
          onSelectionChange={handleSelectionChange}
          onRowClick={handleRowClick}
          serverSide // indicate server-side pagination
          onPageChange={(newPage: number, newPageSize: number) => {
            setPage(newPage);
            setLimit(newPageSize);
          }}
          initialPageSize={limit}
          pageSizeOptions={[2, 5, 10]}
        />
      </div>
    </LayoutMain>
  );
}
