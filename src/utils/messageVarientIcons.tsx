import {
  RiInformationLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiCloseCircleLine,
} from "react-icons/ri";
import type { DialogVariant } from "../types/MessageDialogBoxTypes";

const variantIcons: Record<DialogVariant, React.ReactNode> = {
  info: <RiInformationLine size={104} />, // double 52px
  success: <RiCheckboxCircleLine size={104} />, // corrected from RiCheckboxCircleLine
  warning: <RiErrorWarningLine size={104} />,
  error: <RiCloseCircleLine size={104} />,
};

export default { variantIcons };
