// checkoutSchema.ts (or inline in CheckoutForm)
import type { Schema } from "../../CustomForms/CustomForm"; // adjust import

export const checkoutSchema: Schema = {
  fields: [
    // Section: Contact
    {
      component: "TEXT_FIELD",
      name: "sec_contact",
      label: "Contact Information",
      type: "sub-header",
    },
    {
      component: "TEXT_FIELD",
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: "you@example.com",
      isRequired: true,
      validate: [
        "REQUIRED",
        {
          type: "PATTERN",
          pattern: "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$",
          message: "Please enter a valid email address",
        },
      ],
    },
    {
      component: "TEXT_FIELD",
      name: "fullName",
      label: "Full Name",
      type: "text",
      placeholder: "Jane Doe",
      isRequired: true,
      validate: ["REQUIRED"],
    },

    // Section: Shipping
    {
      component: "TEXT_FIELD",
      name: "sec_shipping",
      label: "Shipping Address",
      type: "sub-header",
    },
    {
      component: "TEXT_FIELD",
      name: "address1",
      label: "Address Line 1",
      type: "text",
      placeholder: "123 Main St",
      isRequired: true,
      validate: ["REQUIRED"],
    },
    {
      component: "TEXT_FIELD",
      name: "address2",
      label: "Address Line 2 (optional)",
      type: "text",
      placeholder: "Apt, suite, etc. (optional)",
    },
    {
      component: "TEXT_FIELD",
      name: "city",
      label: "City",
      type: "text",
      isRequired: true,
      validate: ["REQUIRED"],
    },
    {
      component: "TEXT_FIELD",
      name: "zipCode",
      label: "ZIP / Postal Code",
      type: "text",
      placeholder: "e.g. 02139",
      isRequired: true,
      validate: ["REQUIRED"],
    },
    {
      component: "SELECT",
      name: "country",
      label: "Country",
      options: [
        { label: "United States", value: "US" },
        { label: "Canada", value: "CA" },
        { label: "United Kingdom", value: "GB" },
      ],
      isRequired: true,
      validate: ["REQUIRED"],
    },

    // Section: Payment
    {
      component: "TEXT_FIELD",
      name: "sec_payment",
      label: "Payment Details",
      type: "sub-header",
    },
    {
      component: "SELECT",
      name: "paymentMethod",
      label: "Payment Method",
      options: [
        { label: "Credit / Debit Card", value: "card" },
        { label: "PayPal", value: "paypal" },
      ],
      isRequired: true,
      validate: ["REQUIRED"],
    },

    // Card fields (only required when paymentMethod === 'card' — you can handle conditional validation in handleSubmit)
    {
      component: "TEXT_FIELD",
      name: "cardNumber",
      label: "Card Number",
      type: "text",
      placeholder: "4242 4242 4242 4242",
      isRequired: true,
      validate: [
        "REQUIRED",
        {
          type: "PATTERN",
          // very simple numeric check (13-19 digits)
          pattern: "^[0-9]{13,19}$",
          message: "Card number should be 13–19 digits",
        },
      ],
    },
    {
      component: "TEXT_FIELD",
      name: "expiry",
      label: "Expiry (MM/YY)",
      type: "text",
      placeholder: "MM/YY",
      isRequired: true,
      validate: [
        "REQUIRED",
        {
          type: "PATTERN",
          // MM/YY (01-12 / 00-99)
          pattern: "^(0[1-9]|1[0-2])\\/([0-9]{2})$",
          message: "Expiry must be in MM/YY format",
        },
      ],
    },
    {
      component: "TEXT_FIELD",
      name: "cvc",
      label: "CVC / CVV",
      type: "text",
      placeholder: "123",
      isRequired: true,
      validate: [
        "REQUIRED",
        {
          type: "PATTERN",
          pattern: "^[0-9]{3,4}$",
          message: "CVC must be 3 or 4 digits",
        },
      ],
    },
  ],
};
