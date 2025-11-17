// src/components/users/AddNewUser.tsx
import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import usersService from "../../../services/users.service";
import type { CreateUserPayload, Role } from "../../../services/users.service";

type Props = {
  roles: Role[];
  onCreated?: () => Promise<void> | void;
  compact?: boolean;
};

const AddNewUser: React.FC<Props> = ({ roles = [], onCreated }) => {
  const theme = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (e: SelectChangeEvent<unknown>) => {
    const val = e.target.value;
    if (typeof val === "string") setSelectedRoles(val.split(","));
    else setSelectedRoles(val as string[]);
  };

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setSelectedRoles([]);
  };

  const handleCreate = async () => {
    if (!name.trim() || !email.trim()) {
      // replace with nicer UI validation if desired
      alert("Name and email are required");
      return;
    }

    const payload: CreateUserPayload = {
      name: name.trim(),
      email: email.trim(),
      password: password || undefined,
      roles: selectedRoles,
    };

    setLoading(true);
    try {
      await usersService.createUser(payload);
      reset();
      if (onCreated) await onCreated();
    } catch (err: unknown) {
      console.error("create user failed", err);
      if (err instanceof Error) alert(err?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 2,
        // make the left column sticky on large screens so form stays visible
        position: { lg: "sticky" },
        top: { lg: theme.spacing(10) }, // adjust based on AppBar height
      }}
    >
      <CardContent>
        <Grid container spacing={2}>
          {/* Header */}
          <Grid size={{ xs: 12 }}>
            <Box display="flex" gap={2} alignItems="center">
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                <PersonAddIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Add New User
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.25 }}
                >
                  Create a user and assign roles. Password optional — user can
                  reset later.
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Form fields stacked vertically for narrow column */}
          <Grid size={{ xs: 12 }}>
            <TextField
              id="add-user-name"
              label="Full name"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              size="small"
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              label="Email"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size="small"
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              label="Password"
              placeholder="Optional"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="small"
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <InputLabel sx={{ mb: 0.5 }}>Roles</InputLabel>
            <Select
              multiple
              size="small"
              value={selectedRoles}
              onChange={handleRoleChange}
              fullWidth
              renderValue={(selected) =>
                (selected as string[]).length === 0 ? (
                  <Typography color="text.secondary">Select roles</Typography>
                ) : (
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {(selected as string[]).map((r) => (
                      <Chip key={r} label={r} size="small" />
                    ))}
                  </Box>
                )
              }
            >
              {roles.map((r) => (
                <MenuItem key={r.id} value={r.name}>
                  {r.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          {/* Actions */}
          <Grid size={{ xs: 12 }} sx={{ textAlign: "right" }}>
            <Button
              variant="contained"
              onClick={handleCreate}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} /> : <AddIcon />}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Create user
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AddNewUser;
