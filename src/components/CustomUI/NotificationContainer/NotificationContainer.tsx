// src/components/CustomUI/NotificationContainer/NotificationContainer.tsx
// import type { ProviderProps } from "../../../context/NotificationContext"; // for the position type union if you want to reuse it
import {
  useAppDispatch,
  useAppSelector,
} from "../../../store/hooks/useNotifications";
import { dismissNotification } from "../../../store/slices/notificationSlice";
import NotificationToast from "../NotificationToast/NotificationToast";
import "./notificationcontainer.css";
import { DEFAULT_MAX_VISIBLE } from "../../../utils/notifications";

type Props = {
  maxVisible?: number;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
};

function NotificationContainer({
  maxVisible = DEFAULT_MAX_VISIBLE,
  position = "top-right",
}: Props) {
  const items = useAppSelector((s) => s.notifications.items);
  const dispatch = useAppDispatch();

  const visible = items.slice(0, maxVisible);
  const posClass = `nt-${position}`;

  const dismiss = (id: string) => dispatch(dismissNotification(id));

  return (
    <div
      className={`nt-container ${posClass}`}
      aria-live="polite"
      aria-atomic="true"
    >
      {visible.map((it) => (
        <NotificationToast key={it.id} item={it} dismiss={dismiss} />
      ))}
    </div>
  );
}

export default NotificationContainer;
