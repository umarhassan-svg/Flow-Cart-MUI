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

export type Column<T> = {
  field: string; // unique key for column
  label?: string; // header label
  align?: "left" | "right" | "center";
  width?: number | string;
  // custom renderer for cell value, receives full row
  render?: (row: T) => React.ReactNode;
  // optional accessor when `render` not provided; supports nested keys like 'user.name'
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

  // optional predicate to hide action for a particular row
  visible?: (row: T) => boolean;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  // pagination
  total: number;
  page: number; // zero-based
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement> | null,
    page: number
  ) => void;
  onRowsPerPageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // actions column (optional)
  actions?: RowAction<T>[];
  // custom full-row action renderer (if you need more control)
  rowActionsRender?: (row: T) => React.ReactNode;
  // function to generate key for each row
  rowKey?: string | ((row: T) => string);
  emptyMessage?: string;
};

interface NumberWithIndex {
  [key: string]: number;
}
interface AccObject {
  [key: string]: unknown;
}
function getByAccessor(accessor?: string) {
  if (!accessor) return undefined;
  return accessor.split(".").reduce((acc: AccObject, k: string) => {
    if (acc && k in acc) {
      return { ...acc, [k]: acc[k] };
    }
    return acc;
  }, {} as AccObject);
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

  const getRowKey = (row: T, idx: number) =>
    typeof rowKey === "function"
      ? rowKey(row)
      : (row as NumberWithIndex)[rowKey] ?? String(idx);

  return (
    <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
      <TableContainer sx={{ minHeight: 120 }}>
        <Table>
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
              {(actions || rowActionsRender) && (
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
                <TableRow hover key={getRowKey(row, rowIndex)}>
                  {columns.map((col) => {
                    const value = col.render
                      ? col.render(row)
                      : getByAccessor(col.accessor ?? col.field);
                    // simplest special-case for common patterns: if value is array -> show chips
                    const content =
                      Array.isArray(value) && value.length > 0 ? (
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          {value.map((v: React.ReactNode, i: number) => (
                            <Chip
                              key={String(v) + i}
                              label={String(v)}
                              size="small"
                            />
                          ))}
                        </Box>
                      ) : typeof value === "string" &&
                        value &&
                        col.field.toLowerCase().includes("name") ? (
                        // if column looks like a "name", render avatar + name for nicer UI
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                            {String(value).charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {String(value)}
                            </Typography>
                          </Box>
                        </Stack>
                      ) : (
                        // fallback: render primitive
                        <Typography variant="body2">
                          {JSON.stringify(value) ?? "-"}
                        </Typography>
                      );

                    return (
                      <TableCell key={col.field} align={col.align ?? "left"}>
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
