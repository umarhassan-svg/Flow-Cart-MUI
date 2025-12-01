// Example usage in a parent
import CustomForm from "../../CustomForms/CustomForm";
import type { Schema } from "../../CustomForms/CustomForm";
// import { checkoutSchema } from "./checkoutSchema";

const CheckoutForm = () => {
  // Paste this where you build the schema in your parent component
  const schema2: Schema = {
    fields: [
      // hidden (should not be visible)
      {
        component: "INPUT",
        name: "internal_id",
        label: "Internal ID",
        type: "hidden",
        value: "ABC-123",
        hidden: true,
      },

      // text
      {
        component: "TEXT_FIELD",
        name: "name",
        label: "Full name",
        type: "text",
        placeholder: "Jane Doe",
        isRequired: true,
        validate: ["REQUIRED"],
      },

      // email with PATTERN
      {
        component: "TEXT_FIELD",
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "you@example.com",
        isRequired: true,
        validate: [
          "REQUIRED",
          {
            type: "PATTERN",
            // note: backslashes escaped for TS strings
            pattern: "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$",
            message: "Not a valid email",
          },
        ],
      },

      // password
      {
        component: "TEXT_FIELD",
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "••••••••",
        isRequired: true,
        validate: ["REQUIRED"],
      },

      // tel
      {
        component: "TEXT_FIELD",
        name: "phone",
        label: "Phone",
        type: "tel",
        placeholder: "+1 555 555 5555",
      },

      // url
      {
        component: "TEXT_FIELD",
        name: "website",
        label: "Website",
        type: "url",
        placeholder: "https://example.com",
      },

      // number
      {
        component: "TEXT_FIELD",
        name: "quantity",
        label: "Quantity",
        type: "number",
        placeholder: "0",
        value: 1,
      },

      // range
      {
        component: "TEXT_FIELD",
        name: "satisfaction",
        label: "Satisfaction (0-10)",
        type: "range",
        value: 5,
      },

      // date
      {
        component: "TEXT_FIELD",
        name: "start_date",
        label: "Start date",
        type: "date",
      },

      // month
      {
        component: "TEXT_FIELD",
        name: "billing_month",
        label: "Billing month",
        type: "month",
      },

      // time
      {
        component: "TEXT_FIELD",
        name: "meeting_time",
        label: "Meeting time",
        type: "time",
      },

      // search
      {
        component: "INPUT",
        name: "search",
        label: "Search",
        type: "search",
        placeholder: "Search…",
      },

      // textarea
      {
        component: "TEXT_FIELD",
        name: "notes",
        label: "Notes",
        type: "textarea",
        placeholder: "Add any notes here…",
        value: "",
      },

      // single file upload
      {
        component: "TEXT_FIELD",
        name: "resume",
        label: "Resume (PDF/DOC)",
        type: "file",
        accept: ".pdf,.doc,.docx",
        multiple: false,
        isRequired: false,
      },

      // multiple file upload
      {
        component: "TEXT_FIELD",
        name: "attachments",
        label: "Attachments (multiple)",
        type: "file",
        accept: ".png,.jpg,.pdf",
        multiple: true,
      },

      // checkbox (single)
      {
        component: "CHECKBOX",
        name: "agree",
        label: "I agree to the terms",
        type: "checkbox",
        isRequired: true,
        validate: ["REQUIRED"],
      },

      // checkbox group (implemented as multiple CHECKBOX fields)
      {
        component: "CHECKBOX",
        name: "pref_email",
        label: "Receive emails",
        type: "checkbox",
        value: true,
      },
      {
        component: "CHECKBOX",
        name: "pref_sms",
        label: "Receive SMS",
        type: "checkbox",
        value: false,
      },

      // radio group
      {
        component: "RADIO_BUTTON",
        name: "contact_method",
        label: "Preferred contact method",
        options: ["Email", "Phone", "SMS"],
        validate: ["RADIO_REQUIRED"],
        isRequired: true,
      },

      // select / dropdown
      {
        component: "SELECT",
        name: "country",
        label: "Country",
        options: [
          { label: "Choose a country...", value: "" },
          { label: "United States", value: "us" },
          { label: "Canada", value: "ca" },
          { label: "United Kingdom", value: "uk" },
          { label: "Pakistan", value: "pk" },
        ],
        isRequired: true,
        validate: ["REQUIRED"],
      },

      // buttons (button / submit / reset / image). Note: current renderer maps image->button.
      {
        component: "INPUT",
        name: "preview",
        label: "Preview",
        type: "button",
      },
      {
        component: "INPUT",
        name: "do_reset",
        label: "Reset",
        type: "reset",
      },
      {
        component: "INPUT",
        name: "do_submit",
        label: "Submit (alternate)",
        type: "submit",
      },
      {
        component: "INPUT",
        name: "img_action",
        label: "Image action (renders as button)",
        type: "image",
      },
    ],
  };

  return (
    <>
      <CustomForm
        schema={schema2}
        onSubmit={(data) => console.log("submitted", data)}
      />
    </>
  );
};

export default CheckoutForm;
