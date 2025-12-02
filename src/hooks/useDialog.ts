// useDialog.ts

import { useState, useCallback } from 'react';

// Custom hook to manage the dialog's open/close state
export const useDialog = (initialState: boolean = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const openDialog = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Return the state and the control functions
  return {
    isOpen,
    openDialog,
    closeDialog,
  };
};