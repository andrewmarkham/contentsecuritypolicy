import React from "react";
import { SettingsForm } from "./SettingsForm";

type Props = {
  onDirtyChange?: (dirty: boolean) => void;
  refreshToken?: number;
  resetDirtyToken?: number;
};

export function CspSettings({ onDirtyChange, refreshToken, resetDirtyToken }: Props) {

  return (
    <>
      <SettingsForm onDirtyChange={onDirtyChange} refreshToken={refreshToken} resetDirtyToken={resetDirtyToken} />
    </>
  );
}
