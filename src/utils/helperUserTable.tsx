/* eslint-disable react-refresh/only-export-components */
import { useState } from "react";
import type { User, allowedPages } from "../types/User";
import type { Column } from "../types/TableColumn";

// Enhanced Avatar component with better styling
// eslint-disable-next-line react-refresh/only-export-components
const Avatar_C: React.FC<{
  src?: string;
  name?: string;
  size?: number;
}> = ({ src, name, size = 44 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    {src ? (
      <img
        src={src}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          objectFit: "cover",
          border: "1px solid rgba(15, 23, 42, 0.06)",
          boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
        }}
      />
    ) : (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "#fff",
          fontWeight: 700,
          fontSize: size * 0.4,
          boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
        }}
      >
        {name?.[0]?.toUpperCase() ?? "U"}
      </div>
    )}
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>
        {name}
      </div>
      <div style={{ fontSize: 12, color: "#6b7280" }}>
        {/* optional subtitle */}
      </div>
    </div>
  </div>
);

// Enhanced Chip component
const Chip_C: React.FC<{
  text: string;
  variant?: "default" | "primary" | "success";
}> = ({ text, variant = "default" }) => {
  const variants = {
    default: {
      background: "#f0f6ff",
      color: "#073b8c",
      border: "1px solid rgba(14, 165, 233, 0.12)",
    },
    primary: {
      background: "rgba(37, 99, 235, 0.1)",
      color: "#2563eb",
      border: "1px solid rgba(37, 99, 235, 0.15)",
    },
    success: {
      background: "rgba(16, 185, 129, 0.1)",
      color: "#059669",
      border: "1px solid rgba(16, 185, 129, 0.15)",
    },
  };

  const style = variants[variant];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 12px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        ...style,
        transition: "all 150ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 1px 2px rgba(16, 24, 40, 0.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {text}
    </span>
  );
};

// Enhanced ActionButton component
const ActionButton: React.FC<{
  label: string;
  onClick: (e: React.MouseEvent) => void;
  variant?: "default" | "primary" | "ghost";
  icon?: React.ReactNode;
}> = ({ label, onClick, variant = "default", icon }) => {
  const variants = {
    default: {
      background: "#ffffff",
      color: "#111827",
      border: "1px solid #e6e9ef",
      hoverBackground: "#f7f9fc",
      hoverBorder: "#2563eb",
      hoverColor: "#2563eb",
    },
    primary: {
      background: "linear-gradient(180deg, #2563eb, #0b5ed7)",
      color: "#ffffff",
      border: "1px solid #0b5ed7",
      hoverBackground: "#1d4ed8",
      hoverBorder: "#1d4ed8",
      hoverColor: "#ffffff",
    },
    ghost: {
      background: "transparent",
      color: "#6b7280",
      border: "1px solid transparent",
      hoverBackground: "#f6f8fb",
      hoverBorder: "transparent",
      hoverColor: "#111827",
    },
  };

  const style = variants[variant];
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "8px 14px",
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 150ms ease",
        whiteSpace: "nowrap",
        background: isHovered ? style.hoverBackground : style.background,
        color: isHovered ? style.hoverColor : style.color,
        border: isHovered ? `1px solid ${style.hoverBorder}` : style.border,
        transform: isHovered ? "translateY(-1px)" : "translateY(0)",
        boxShadow: isHovered ? "0 1px 2px rgba(16, 24, 40, 0.04)" : "none",
      }}
    >
      {icon}
      {label}
    </button>
  );
};

export { Avatar_C, Chip_C, ActionButton };

// Column definitions for User with enhanced styling
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
    id: "effectivePerms",
    header: "Permissions",
    align: "center",
    render: (u: User) => {
      const count = (u.effectivePermissions ?? u.permissions ?? []).length;
      return (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "6px 12px",
            borderRadius: 8,
            background:
              count > 0 ? "rgba(16, 185, 129, 0.08)" : "rgba(15, 23, 42, 0.04)",
            color: count > 0 ? "#059669" : "#6b7280",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          {count}
        </div>
      );
    },
    width: "120px",
  },
  {
    id: "allowedPages",
    header: "Allowed Pages",
    render: (u: User) => {
      const pages = u.allowedPages ?? [];
      if (pages.length === 0)
        return <span style={{ color: "#9ca3af", fontSize: 13 }}>None</span>;

      return (
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            maxWidth: 420,
          }}
        >
          {pages.map((p: allowedPages) => (
            <div
              key={p.key}
              title={`${p.label} - ${p.path}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 12px",
                borderRadius: 6,
                background: "#f7f9fc",
                fontSize: 12,
                border: "1px solid #eef2f7",
                transition: "all 150ms ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#eef2f7";
                e.currentTarget.style.borderColor = "#2563eb";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f7f9fc";
                e.currentTarget.style.borderColor = "#eef2f7";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <span style={{ fontWeight: 600, color: "#111827" }}>
                {p.label}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "#6b7280",
                  fontWeight: 500,
                }}
              >
                #{p.order}
              </span>
            </div>
          ))}
        </div>
      );
    },
    width: "420px",
  },
  {
    id: "actions",
    header: "Actions",
    align: "center",
    render: (u: User) => (
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
        }}
      >
        <ActionButton
          label="View"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            console.log("View user:", u.id);
            alert(`View ${u.name}`);
          }}
        />
        <ActionButton
          label="Edit"
          variant="default"
          onClick={(e) => {
            e.stopPropagation();
            console.log("Edit user:", u.id);
            alert(`Edit ${u.name}`);
          }}
        />
      </div>
    ),
    width: "180px",
  },
];

export default columns;
