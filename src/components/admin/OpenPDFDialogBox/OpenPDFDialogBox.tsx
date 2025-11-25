import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

type Props = {
  open: boolean;
  pdfUrl: string | null;
  title?: string;
  onClose: () => void;
};

export default function OpenPDFDialogBox({
  open,
  pdfUrl,
  title = "PDF Viewer",
  onClose,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!pdfUrl) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="open-pdf-dialog-title"
      PaperProps={{
        sx: {
          width: isMobile ? "95%" : "70vw",
          height: isMobile ? "90vh" : "80vh",
          maxWidth: "none",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden", // remove outer scrollbar
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        id="open-pdf-dialog-title"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pr: 1,
          minHeight: 56,
        }}
      >
        <Typography
          component="span"
          variant={isMobile ? "subtitle2" : "subtitle1"}
        >
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small" aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* PDF Content */}
      <DialogContent
        sx={{
          flex: 1,
          p: 0,
          display: "flex",
          overflow: "hidden", // prevents outer scrollbar
        }}
      >
        {pdfUrl ? (
          <Box sx={{ flex: 1, width: "100%", height: "100%" }}>
            <iframe
              title="pdf-preview"
              src={pdfUrl}
              style={{
                border: 0,
                width: "100%",
                height: "100%",
                overflow: "auto", // inner PDF scroll
              }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 2,
            }}
          >
            <Typography>No PDF selected</Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
