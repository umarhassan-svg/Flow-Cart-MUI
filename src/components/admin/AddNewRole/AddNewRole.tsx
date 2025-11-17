// src/components/admin/AddNewRole/AddNewRole.tsx
import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import rolesService from "../../../services/roles.service";
import type { CreateRolePayload } from "../../../services/roles.service";

type Props = {
  onCreated?: () => Promise<void> | void;
  initialPages?: string[]; // optional list of page names to suggest
};

const defaultPages = ["dashboard", "users", "roles", "products", "orders"];

const AddNewRole: React.FC<Props> = ({
  onCreated,
  initialPages = defaultPages,
}) => {
  const theme = useTheme();
  const [name, setName] = useState("");
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      alert("Role name is required");
      return;
    }
    const payload: CreateRolePayload = { name: name.trim(), pages };
    setLoading(true);
    try {
      await rolesService.createRole(payload);
      setName("");
      setPages([]);
      if (onCreated) await onCreated();
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) alert(err?.message || "Failed to create role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card elevation={3} sx={{ borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 1 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1,
              bgcolor: theme.palette.primary.main,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "common.white",
              fontWeight: 700,
            }}
          >
            R
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Add New Role
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create a role and assign accessible pages.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "grid", gap: 2 }}>
          <TextField
            label="Role name"
            placeholder="e.g. manager"
            size="small"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Box>
            <InputLabel sx={{ mb: 0.5 }}>Pages</InputLabel>
            <Select
              multiple
              fullWidth
              size="small"
              value={pages}
              onChange={(e) => {
                const val = e.target.value as string | string[];
                setPages(typeof val === "string" ? val.split(",") : val);
              }}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {(selected as string[]).map((p) => (
                    <Chip key={p} label={p} size="small" />
                  ))}
                </Box>
              )}
            >
              {initialPages.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box sx={{ textAlign: "right" }}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />}
              onClick={handleCreate}
              disabled={loading}
            >
              Create role
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AddNewRole;
