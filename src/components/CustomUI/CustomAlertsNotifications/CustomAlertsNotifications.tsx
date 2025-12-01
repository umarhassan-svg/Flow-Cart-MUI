import "./customalerts.css";

const CustomAlerts = ({ message, type }: { message: string; type: string }) => {
  return (
    <div
      className={`alert alert-${type} alert-dismissible fade show custom-alert`}
      role="alert"
    >
      {message}
      <button
        type="button"
        className="btn-close"
        data-bs-dismiss="alert"
        aria-label="Close"
      ></button>
    </div>
  );
};

export default CustomAlerts;
