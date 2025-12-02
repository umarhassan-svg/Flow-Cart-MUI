/* eslint-disable @typescript-eslint/no-explicit-any */
/* customForm.tsx */
import React, { useEffect, useMemo, useState } from "react";
import type {
  Schema,
  PatternValidator,
  FieldConfig,
} from "../../../types/FormTypes";
import "./customform.css";

type Props = {
  title?: string;
  subtitle?: string;
  schema?: Schema; // optional so component won't crash if parent forgets to pass it
  onSubmit?: (formData: Record<string, any>) => void;
  submitLabel?: string;
  maxWidth?: number | string;
};

export default function CustomForm({
  title,
  subtitle,
  schema = { fields: [] },
  onSubmit,
  submitLabel = "Submit",
  maxWidth,
}: Props) {
  // --- compute initial values as an object (useMemo) ---
  const initialValues = useMemo(() => {
    const v: Record<string, any> = {};
    (schema.fields ?? []).forEach((f) => {
      if (f.value !== undefined) v[f.name] = f.value;
      else if (f.component === "CHECKBOX") v[f.name] = false;
      else if (f.type === "file") v[f.name] = f.multiple ? [] : null;
      else v[f.name] = "";
    });
    return v;
  }, [schema.fields]);

  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // reset state when schema changes
    const set_values = () => {
      setValues(initialValues);
      setErrors({});
      setTouched({});
      console.log(touched);
    };
    set_values();
  }, [initialValues]);

  // small guard for debugging: show console if schema is empty
  useEffect(() => {
    if (
      !schema ||
      !Array.isArray(schema.fields) ||
      schema.fields.length === 0
    ) {
      // comment this out in production
      console.warn("CustomForm: schema is empty or missing. Received:", schema);
    }
  }, [schema]);

  const validateField = (field: FieldConfig, value: any) => {
    if (!field.validate || field.validate.length === 0) return "";
    for (const rule of field.validate) {
      if (rule === "REQUIRED") {
        if (field.type === "file") {
          const isEmpty =
            !value || (Array.isArray(value) && value.length === 0);
          if (isEmpty) return `${field.label ?? field.name} is required`;
        } else {
          const isEmpty =
            value === "" ||
            value === null ||
            value === undefined ||
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === "boolean" &&
              value === false &&
              field.component === "CHECKBOX" &&
              field.isRequired);
          if (isEmpty) return `${field.label ?? field.name} is required`;
        }
      } else if (rule === "RADIO_REQUIRED") {
        if (!value) return `${field.label ?? field.name} is required`;
      } else if (typeof rule === "object" && (rule as any).type === "PATTERN") {
        const r = rule as PatternValidator;
        let re: RegExp;
        try {
          re = new RegExp(r.pattern);
        } catch (err) {
          console.error(err, "CustomForm: Invalid regex pattern:", r.pattern);
          continue;
        }
        if (!re.test(String(value ?? "")))
          return r.message ?? `${field.label ?? field.name} is invalid`;
      }
    }
    return "";
  };

  const validateAll = () => {
    const newErrors: Record<string, string> = {};
    (schema.fields ?? []).forEach((f) => {
      if (f.hidden) return;
      const err = validateField(f, values[f.name]);
      if (err) newErrors[f.name] = err;
    });
    setErrors(newErrors);
    return newErrors;
  };

  const handleChange =
    (field: FieldConfig) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const type =
        field.type ?? (field.component === "CHECKBOX" ? "checkbox" : "text");

      if (type === "file") {
        const target = e.target as HTMLInputElement;
        const fileValue = field.multiple
          ? target.files
            ? Array.from(target.files)
            : []
          : target.files && target.files[0]
          ? target.files[0]
          : null;

        setValues((prev) => ({ ...prev, [field.name]: fileValue }));
        setTouched((t) => ({ ...t, [field.name]: true }));
        setErrors((errs) => ({
          ...errs,
          [field.name]: validateField(field, fileValue),
        }));
        return;
      }

      if (type === "checkbox") {
        const target = e.target as HTMLInputElement;
        setValues((prev) => ({ ...prev, [field.name]: target.checked }));
        setTouched((t) => ({ ...t, [field.name]: true }));
        setErrors((errs) => ({
          ...errs,
          [field.name]: validateField(field, target.checked),
        }));
        return;
      }

      // default
      const value = (e.target as HTMLInputElement).value;
      setValues((prev) => ({ ...prev, [field.name]: value }));
      setTouched((t) => ({ ...t, [field.name]: true }));
      setErrors((errs) => ({
        ...errs,
        [field.name]: validateField(field, value),
      }));
    };

  const handleRadioChange = (field: FieldConfig, optionValue: string) => {
    setValues((prev) => ({ ...prev, [field.name]: optionValue }));
    setTouched((t) => ({ ...t, [field.name]: true }));
    setErrors((errs) => ({
      ...errs,
      [field.name]: validateField(field, optionValue),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateAll();
    if (Object.keys(newErrors).length === 0) {
      if (onSubmit) onSubmit(values);
      else console.log("Form submitted", values);
    } else {
      const firstKey = Object.keys(newErrors)[0];
      const el = document.querySelector(
        `[name="${firstKey}"]`
      ) as HTMLElement | null;
      if (el) el.focus();
    }
  };

  const renderField = (field: FieldConfig) => {
    // don't spread `value` onto inputs that shouldn't have it (we handle file/checkbox/radio separately)
    const commonProps = {
      name: field.name,
      id: field.name,
      placeholder: field.placeholder ?? "",
      onChange: handleChange(field),
      "aria-required": field.isRequired ? true : false,
      "aria-invalid": !!errors[field.name],
      className: `cf-input ${errors[field.name] ? "cf-input-error" : ""}`,
    } as any;

    if (field.hidden) {
      return (
        <input
          type="hidden"
          name={field.name}
          value={values[field.name] ?? ""}
        />
      );
    }

    switch (field.component) {
      case "TEXT_FIELD":
      case "INPUT":
      default:
        if (field.type === "sub-header") {
          return (
            <div className="cf-sub-header">
              <strong>{field.label}</strong>
            </div>
          );
        }
        if (field.type === "textarea") {
          return (
            <textarea
              {...commonProps}
              rows={4}
              className={`cf-textarea ${
                errors[field.name] ? "cf-input-error" : ""
              }`}
              value={values[field.name] ?? ""}
            />
          );
        }

        if (field.type === "file") {
          return (
            <input
              type="file"
              name={field.name}
              id={field.name}
              onChange={handleChange(field)}
              accept={field.accept}
              multiple={!!field.multiple}
              className="cf-file"
            />
          );
        }

        if (
          field.type === "button" ||
          field.type === "submit" ||
          field.type === "reset" ||
          field.type === "image"
        ) {
          return (
            <button
              type={
                field.type === "submit"
                  ? "submit"
                  : field.type === "reset"
                  ? "reset"
                  : "button"
              }
              name={field.name}
              id={field.name}
              className="cf-button"
            >
              {field.label ?? field.name}
            </button>
          );
        }

        return (
          <input
            {...commonProps}
            value={values[field.name] ?? ""}
            type={field.type ?? "text"}
          />
        );

      case "CHECKBOX":
        return (
          <label className="cf-checkbox-label">
            <input
              type="checkbox"
              name={field.name}
              id={field.name}
              checked={!!values[field.name]}
              onChange={handleChange(field)}
            />
            <span className="cf-checkbox-custom" />
            <span className="cf-checkbox-text">{field.label}</span>
          </label>
        );

      case "RADIO_BUTTON":
        return (
          <div
            role="radiogroup"
            aria-labelledby={`${field.name}-label`}
            className="cf-radio-group"
          >
            {(field.options ?? []).map((opt: any, idx: number) => {
              const optLabel = typeof opt === "string" ? opt : opt.label;
              const optVal = typeof opt === "string" ? opt : opt.value;
              return (
                <label key={idx} className="cf-radio-label">
                  <input
                    type="radio"
                    name={field.name}
                    value={optVal}
                    checked={values[field.name] === optVal}
                    onChange={() => handleRadioChange(field, optVal)}
                  />
                  <span className="cf-radio-custom" />
                  <span className="cf-radio-text">{optLabel}</span>
                </label>
              );
            })}
          </div>
        );

      case "SELECT":
        return (
          <select {...commonProps} value={values[field.name] ?? ""}>
            <option value="">Select...</option>
            {(field.options ?? []).map((opt: any, idx: number) => {
              const optLabel = typeof opt === "string" ? opt : opt.label;
              const optVal = typeof opt === "string" ? opt : opt.value;
              return (
                <option value={optVal} key={idx}>
                  {optLabel}
                </option>
              );
            })}
          </select>
        );
    }
  };

  // If schema has no fields show friendly message (helps debugging)
  if (!schema || !Array.isArray(schema.fields) || schema.fields.length === 0) {
    return (
      <div className="cf-container">
        <div className="cf-form">
          <p style={{ color: "#374151" }}>
            No fields to render (schema is empty).
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {(title || subtitle) && (
        <div className="cf-header" style={maxWidth ? { maxWidth } : undefined}>
          {title && <h2 className="cf-title">{title}</h2>}
          {subtitle && <p className="cf-description">{subtitle}</p>}
        </div>
      )}

      <div className="cf-container">
        <form
          className="cf-form"
          onSubmit={handleSubmit}
          noValidate
          style={maxWidth ? { maxWidth } : undefined}
        >
          {schema.fields.map((field) => (
            <div
              key={field.name}
              className={`cf-field ${field.hidden ? "cf-hidden" : ""}`}
            >
              {!field.hidden &&
                field.label &&
                field.component !== "CHECKBOX" &&
                field.type !== "sub-header" && (
                  <label
                    htmlFor={field.name}
                    id={`${field.name}-label`}
                    className="cf-label"
                  >
                    {field.label}
                    {field.isRequired ? (
                      <span className="cf-required">*</span>
                    ) : null}
                  </label>
                )}

              {renderField(field)}

              {errors[field.name] && (
                <div className="cf-error">{errors[field.name]}</div>
              )}
              {field.component === "CHECKBOX" && field.label && (
                <div className="cf-help" />
              )}
            </div>
          ))}

          <div className="cf-actions">
            <button type="submit" className="cf-primary">
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
