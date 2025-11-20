/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/ui/DataTable.tsx
import React from "react";
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";

// ... [Keep your Type definitions (Column, colorType, RowAction, Props) exactly the same] ...

export type Column<T> = {
  field: string;
  label?: string;
  align?: "left" | "right" | "center";
  width?: number | string;
  render?: (row: T) => React.ReactNode;
  accessor?: string;
};

export type colorType =
  | "inherit"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

export type RowAction<T> = {
  key: string;
  label?: string;
  icon: React.ReactNode;
  onClick: (row: T) => void;
  color?: colorType;
  visible?: (row: T) => boolean;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  total: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, page: number) => void;
  onRowsPerPageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  actions?: RowAction<T>[];
  rowActionsRender?: (row: T) => React.ReactNode;
  rowKey?: string | ((row: T) => string);
  emptyMessage?: string;
};

function getByAccessor(
  obj: Record<string, unknown> | undefined,
  accessor?: string
) {
  if (!accessor || !obj) return undefined;
  return accessor
    .split(".")
    .reduce<Record<string, unknown> | unknown>((acc: any, k: string) => {
      if (acc && typeof acc === "object")
        return (acc as Record<string, unknown>)[k];
      return undefined;
    }, obj);
}

function DataTableInner<T>({
  columns,
  rows,
  loading = false,
  total,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  actions,
  rowActionsRender,
  rowKey = "id",
  emptyMessage = "No records found",
}: Props<T>) {
  const theme = useTheme();

  const getRowKey = (row: T, idx: number): string =>
    typeof rowKey === "function"
      ? rowKey(row)
      : ((row as unknown as Record<string, unknown>)[
          rowKey as string
        ] as string) ?? String(idx);

  return (
    <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
      {/* Enforce a max height on container if desired, or keep auto */}
      <TableContainer sx={{ minHeight: 120 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.background.paper }}>
              {columns.map((col) => (
                <TableCell
                  key={col.field}
                  align={col.align ?? "left"}
                  sx={{ fontWeight: 700, width: col.width }}
                >
                  {col.label ?? col.field}
                </TableCell>
              ))}
              {(actions?.length != 0 || rowActionsRender) && (
                <TableCell align="right" sx={{ fontWeight: 700, width: 120 }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length + (actions || rowActionsRender ? 1 : 0)
                  }
                  align="center"
                  sx={{ py: 6 }}
                >
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length + (actions || rowActionsRender ? 1 : 0)
                  }
                  align="center"
                  sx={{ py: 6 }}
                >
                  <Typography color="text.secondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, rowIndex) => (
                // FIXED: Set a fixed height here if you want strict strict rows,
                // but usually preventing wrap below is enough.
                <TableRow hover key={getRowKey(row, rowIndex)}>
                  {columns.map((col) => {
                    const value = col.render
                      ? col.render(row)
                      : getByAccessor(
                          row as unknown as Record<string, unknown>,
                          col.accessor ?? col.field
                        );

                    // --- LOGIC CHANGE STARTS HERE ---
                    let content: React.ReactNode;

                    if (Array.isArray(value) && value.length > 0) {
                      // 1. LIMIT ARRAY ITEMS to keep row height consistent
                      const MAX_ITEMS_TO_SHOW = 2;
                      const visibleItems = value.slice(0, MAX_ITEMS_TO_SHOW);
                      const remaining = value.length - MAX_ITEMS_TO_SHOW;

                      content = (
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            alignItems: "center",
                            // IMPORTANT: Prevent wrapping to keep row height fixed
                            flexWrap: "nowrap",
                            overflow: "hidden",
                          }}
                        >
                          {visibleItems.map((v: unknown, i: number) => (
                            <Chip
                              key={String(v) + i}
                              label={String(v)}
                              size="small"
                            />
                          ))}
                          {/* Show +N or ... if there are extra items */}
                          {remaining > 0 && (
                            <Tooltip title={`And ${remaining} more items...`}>
                              <Chip
                                label="..."
                                size="small"
                                variant="outlined"
                                sx={{ minWidth: "30px" }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                      );
                    } else if (
                      typeof value === "string" &&
                      value &&
                      col.field.toLowerCase().includes("name")
                    ) {
                      content = (
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                            {String(value).charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            {" "}
                            {/* minWidth 0 is needed for flex child truncation */}
                            <Typography variant="subtitle2" noWrap>
                              {String(value)}
                            </Typography>
                          </Box>
                        </Stack>
                      );
                    } else {
                      // Default text renderer
                      content = (
                        <Typography
                          variant="body2"
                          noWrap
                          title={String(value ?? "")}
                        >
                          {(value as string) ?? "-"}
                        </Typography>
                      );
                    }
                    // --- LOGIC CHANGE ENDS HERE ---

                    return (
                      <TableCell
                        key={col.field}
                        align={col.align ?? "left"}
                        // Optional: Enforce max width on cell to force truncation logic to kick in
                        sx={{
                          maxWidth: col.width ?? 200, // Fallback width if not defined
                          whiteSpace: "nowrap", // Helps keep text in one line
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {content}
                      </TableCell>
                    );
                  })}

                  {(actions || rowActionsRender) && (
                    <TableCell align="right">
                      {rowActionsRender ? (
                        rowActionsRender(row)
                      ) : (
                        <>
                          {actions?.map((a) =>
                            (a.visible ? a.visible(row) : true) ? (
                              <Tooltip key={a.key} title={a.label ?? ""}>
                                <IconButton
                                  size="small"
                                  onClick={() => a.onClick(row)}
                                  color={a.color as colorType}
                                >
                                  {a.icon}
                                </IconButton>
                              </Tooltip>
                            ) : null
                          )}
                        </>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 20, 50]}
      />
    </Paper>
  );
}

/**
 * Generic DataTable (typed)
 */
function DataTable<T>(props: Props<T>) {
  return <DataTableInner {...props} />;
}

export default DataTable;
