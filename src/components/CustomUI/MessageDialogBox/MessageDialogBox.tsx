import React from "react";
import type {
  DialogAction,
  DialogVariant,
} from "../../../types/MessageDialogBoxTypes";
import "./MessageDialogBox.css";
import {
  RiInformationLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiCloseCircleLine,
} from "react-icons/ri";

const variantIcons: Record<DialogVariant, React.ReactNode> = {
  info: <RiInformationLine size={104} />, // double 52px
  success: <RiCheckboxCircleLine size={104} />, // corrected from RiCheckboxCircleLine
  warning: <RiErrorWarningLine size={104} />,
  error: <RiCloseCircleLine size={104} />,
};

export interface MessageDialogBoxProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  actions: DialogAction[];
  title?: string;
  variant?: DialogVariant;
  // NOTE: layout removed — dialog is centered / portrait by design
  children?: React.ReactNode;
}

const MessageDialogBox: React.FC<MessageDialogBoxProps> = ({
  isOpen,
  onClose,
  title,
  message,
  actions,
  variant = "info",
  children,
}) => {
  if (!isOpen) return null;

  const dialogIcon: React.ReactNode = variantIcons[variant];

  return (
    <div
      className="dialog-backdrop"
      onClick={onClose}
      aria-hidden={false}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "dialog-title" : undefined}
        aria-describedby="dialog-message"
        className={`dialog-box dialog-variant-${variant}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Big centered icon on top */}
        <div className="dialog-icon-wrapper" aria-hidden>
          {dialogIcon}
        </div>

        {/* Title (optional) */}
        {title && (
          <h3 className="dialog-message-title" id="dialog-title">
            {title}
          </h3>
        )}

        {/* Message */}
        <p className="dialog-message-text" id="dialog-message">
          {message}
        </p>

        {children}

        {/* Actions (centered, at bottom) */}
        <div
          className="dialog-actions"
          role="group"
          aria-label="Dialog actions"
        >
          {actions.map((action) => (
            <button
              key={action.key}
              className={`dialog-btn ${
                action.isPrimary ? "btn-primary" : "btn-secondary"
              }`}
              onClick={(e) => {
                try {
                  action.onClick(e);
                } finally {
                  // close after action
                  onClose();
                }
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MessageDialogBox;
