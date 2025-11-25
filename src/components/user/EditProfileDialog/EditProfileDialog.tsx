import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
} from "@mui/material";

// Define the expected modes and data structure for clarity
type EditMode = "personal-information" | "address" | null;

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  mode: EditMode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData: any; // Use a more specific type if possible (e.g., ProfileData)
}

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
  open,
  onClose,
  mode,
  initialData,
}) => {
  // Simple state management for the form fields
  const [formData, setFormData] = React.useState(initialData);

  // Update form data when initialData or mode changes
  React.useEffect(() => {
    // This is important to reset the form when a new mode is opened
    setFormData(initialData);
  }, [initialData, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // 1. Validation logic goes here

    // 2. Call API to save changes based on the 'mode'
    console.log(`Saving changes for mode: ${mode}`, formData);

    // 3. Close the dialog
    onClose();
  };

  // --- Render content based on mode ---
  const renderFormContent = () => {
    if (!mode) return null;

    if (mode === "personal-information") {
      return (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={formData.firstName || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={formData.lastName || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Date of Birth"
              name="dob"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.dob || ""}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      );
    }

    if (mode === "address") {
      return (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Street Address"
              name="street"
              value={formData.street || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={formData.city || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Country"
              name="country"
              value={formData.country || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Postal Code"
              name="postalCode"
              value={formData.postalCode || ""}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      );
    }

    return <Typography>Select an edit section to begin.</Typography>;
  };

  const dialogTitle = mode
    ? `Edit ${mode
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")}`
    : "Edit Profile";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent dividers>{renderFormContent()}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          disabled={!mode}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileDialog;
