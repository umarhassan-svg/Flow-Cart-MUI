export interface DialogAction {
  key: string;
  label: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isPrimary?: boolean;
}

export type DialogVariant = "info" | "success" | "warning" | "error";
