import React from "react";
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

type Props = {
  title: string;
  open: boolean;
  onClose: () => void;
  message: string;
};

const CustomDialogbox = ({ title, open, onClose, message }: Props) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <DialogContentText
          sx={{
            fontSize: "0.95rem",
            color: "text.secondary",
            mt: 1,
          }}
        >
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          fullWidth
          sx={{
            textTransform: "none",
            borderRadius: 2,
            fontWeight: 600,
          }}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomDialogbox;
