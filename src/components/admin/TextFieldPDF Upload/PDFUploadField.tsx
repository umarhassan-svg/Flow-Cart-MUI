import React, { useRef, useState, useEffect } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";

type Props = {
  label?: string;
  helperText?: string;
  onFileChange?: (file: File | null) => void;
  onView?: () => void;
  fileUrl?: string | null; // server file URL
};

export default function PDFUploadField({
  label = "Upload PDF",
  helperText,
  onFileChange,
  onView,
  fileUrl,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [localSelected, setLocalSelected] = useState<boolean>(false);

  // Populate fileName from server only if user hasn't selected a local file
  useEffect(() => {
    const set_filename = () => {
      if (!fileUrl) {
        // no server url -> if user hasn't selected locally, clear name
        if (!localSelected) setFileName("");
        return;
      }

      if (localSelected) {
        // user has chosen a local file — don't override it
        return;
      }

      const name = decodeURIComponent(fileUrl.split("/").pop() ?? "");
      setFileName(name);
    };

    set_filename();
  }, [fileUrl, localSelected]);

  const chooseFile = () => inputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;

    if (!f) {
      // user cleared selection (or cancelled)
      setLocalSelected(false);
      setFileName(
        fileUrl ? decodeURIComponent(fileUrl.split("/").pop() ?? "") : ""
      );
      onFileChange?.(null);

      // ensure the input is cleared so same file can be chosen again later
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const isPdf =
      f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      alert("Please select a PDF file.");
      if (inputRef.current) inputRef.current.value = "";
      // keep server filename (if any) when invalid selection
      setFileName(
        fileUrl ? decodeURIComponent(fileUrl.split("/").pop() ?? "") : ""
      );
      onFileChange?.(null);
      setLocalSelected(false);
      return;
    }

    // user selected a valid local file — show its original name
    setFileName(f.name);
    setLocalSelected(true);
    onFileChange?.(f);

    // clear native input value so the same file can be selected again later
    e.currentTarget.value = "";
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {label}
      </Typography>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Button + FileName + View Button */}
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ border: 1, borderRadius: 1, borderColor: "#ccc", p: 1 }}
      >
        <Button variant="outlined" onClick={chooseFile}>
          Choose PDF
        </Button>

        <Typography variant="body2" sx={{ flexGrow: 1 }}>
          {fileName || "No file selected"}
        </Typography>

        <Button
          variant="text"
          disabled={!fileName}
          onClick={() => onView && onView()}
        >
          View
        </Button>
      </Stack>

      {helperText && (
        <Typography variant="caption" color="text.secondary">
          {helperText}
        </Typography>
      )}
    </Box>
  );
}
