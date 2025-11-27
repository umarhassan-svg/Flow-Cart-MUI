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
    // keep your custom Avatar (profile picture + name)
    render: (u: User) => <Avatar_C src={u.profilePicturePath} name={u.name} />,
    width: "280px",
  },

  {
    id: "email",
    header: "Email",
    accessor: (u: User) => u.email,
    width: "260px",
    // keep your email styling for visual consistency
    render: (u: User) => (
      <span style={{ color: "#6b7280", fontSize: 14 }}>{u.email}</span>
    ),
  },

  //   {
  //     id: "createdAt",
  //     header: "Created",
  //     accessor: (u: User) => {
  //       return Date.now();
  //     }, // expects an ISO string or Date
  //     type: "date", // CustomTable will format automatically
  //     width: "180px",
  //   },

  //   {
  //     id: "lastLogin",
  //     header: "Last login",
  //     accessor: (u: User) => {
  //       return Date.now();
  //     }, // ISO or Date
  //     type: "date",
  //     width: "180px",
  //   },
  //   {
  //     id: "status",
  //     header: "Status",
  //     accessor: (u: User) => u.status, // e.g. 'active' | 'pending' | 'inactive'
  //     type: "status", // CustomTable renders a status badge
  //     width: "140px",
  //     align: "center",
  //   },

  {
    id: "roles",
    header: "Roles",
    accessor: (u: User) => u.roles, // string[]
    type: "chips", // first chip shown, overflow handled automatically
    width: "220px",
    // optional: show primary role with different visual using className if you want
  },

  {
    id: "permissions",
    header: "Permissions",
    accessor: (u: User) => u.effectivePermissions, // string[] (optional on user)
    type: "chips", // will show first permission + overflow button when many
    width: "200px",
  },

  {
    id: "actions",
    header: "Actions",
    // Use built-in buttons/menu renderer: `type: "buttons"` with `options`
    type: "buttons",
    options: [
      {
        key: "edit",
        label: "Edit",
        variant: "primary",
        onClick: (u: User) => {
          // Simple handler — keep as is or wire to router/modal
          console.log("Edit", u.id);
        },
      },
      {
        key: "impersonate",
        label: "Impersonate",
        variant: "ghost",
        onClick: (u: User) => {
          console.log("Impersonate", u.id);
        },
      },
      {
        key: "delete",
        label: "Delete",
        variant: "danger",
        onClick: (u: User) => {
          console.log("Delete", u.id);
        },
      },
    ],
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
