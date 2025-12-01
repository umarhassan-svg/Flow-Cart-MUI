import type { NotificationItem } from "../../../types/Notification";
import NotificationToast from "../NotificationToast/NotificationToast";
import type { ProviderProps } from "../../../context/NotificationContext";
import "./notificationcontainer.css";
type ContainerProps = {
  items: NotificationItem[];
  dismiss: (id: string) => void;
  maxVisible: number;
  position: ProviderProps["position"];
};

function NotificationContainer({
  items,
  dismiss,
  maxVisible,
  position,
}: ContainerProps) {
  // show up to maxVisible, keep rest queued
  const visible = items.slice(0, maxVisible);

  // determine container class based on position
  const posClass = `nt-${position}`;

  return (
    <div
      className={`nt-container ${posClass}`}
      aria-live="polite"
      aria-atomic="true"
    >
      {visible.map((it) => (
        <NotificationToast
          key={it.id}
          item={it}
          onClose={() => dismiss(it.id)}
        />
      ))}
    </div>
  );
}

export default NotificationContainer;
