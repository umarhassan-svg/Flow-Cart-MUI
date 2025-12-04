// store/slices/sessionSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User, allowedPages } from "../../types/User";

interface SessionState {
  token: string | null;
  user: User | null;
  effectivePermissions: string[];
  allowedPages: allowedPages[];
}

const initialState: SessionState = {
  token: null,
  user: null,
  effectivePermissions: [],
  allowedPages: [],
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setSession: (
      state,
      action: PayloadAction<{
        token: string | null;
        user: User | null;
        effectivePermissions?: string[];
        allowedPages?: allowedPages[];
      }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;

      state.effectivePermissions = action.payload.effectivePermissions ?? [];
      state.allowedPages = action.payload.allowedPages ?? [];
    },

    clearSession: (state) => {
      state.token = null;
      state.user = null;
      state.effectivePermissions = [];
      state.allowedPages = [];
    },
  },
});

export const { setSession, clearSession } = sessionSlice.actions;

export default sessionSlice.reducer;
