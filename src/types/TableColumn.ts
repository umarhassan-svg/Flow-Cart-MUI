type Align = "left" | "center" | "right";

type Accessor<T> = keyof T | ((row: T) => React.ReactNode);

export type Column<T> = {
  id: string;
  header: React.ReactNode;
  accessor?: Accessor<T>;
  render?: (row: T, rowIndex: number) => React.ReactNode;
  width?: string;
  align?: Align;
  className?: string;
};
