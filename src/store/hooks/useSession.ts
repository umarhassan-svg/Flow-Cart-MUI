// src/store/hooks/useSession.ts
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../index";
import { setSession, clearSession } from "../slices/sessionSlice";
import type { User, allowedPages } from "../../types/User";

export const useSession = () => {
  const dispatch: AppDispatch = useDispatch();
  const session = useSelector((state: RootState) => state.session);

  const saveSessionRedux = (
    token: string | null,
    user: User | null,
    effectivePermissions?: string[],
    allowedPagesArr?: allowedPages[]
  ) => {
    dispatch(
      setSession({
        token,
        user,
        effectivePermissions,
        allowedPages: allowedPagesArr,
      })
    );
  };

  const clearSessionRedux = () => {
    dispatch(clearSession());
  };

  return {
    ...session,
    saveSession: saveSessionRedux,
    clearSession: clearSessionRedux,
  };
};
