export type PatternValidator = {
  type: "PATTERN";
  pattern: string;
  message?: string;
};

export type Validator = "REQUIRED" | "RADIO_REQUIRED" | PatternValidator;

export type FieldConfig = {
  component: string;
  name: string;
  label?: string;
  isRequired?: boolean;
  validate?: Validator[];
  type?: string;
  placeholder?: string;
  options?: string[] | { label: string; value: string }[];
  accept?: string;
  multiple?: boolean;
  value?: string | number | boolean;
  hidden?: boolean;
};

export type Schema = {
  fields: FieldConfig[];
};