import { useState } from "react";
import { EyeOffIcon } from "../../../components/icons/EyeOffIcon";
import { EyeIcon } from "../../../components/icons/EyeIcon";

export function PasswordToggle({
  fieldId,
  disabled,
}: {
  fieldId: string;
  disabled: boolean;
}) {
  const [visible, setVisible] = useState(false);

  const toggle = () => {
    const input = document.getElementById(fieldId) as HTMLInputElement | null;
    if (!input) return;
    input.type = visible ? "password" : "text";
    setVisible((v) => !v);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      aria-label={visible ? "Hide password" : "Show password"}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors disabled:pointer-events-none cursor-pointer"
    >
      {visible ? (
        // Eye-off
        <EyeOffIcon />
      ) : (
        // Eye
        <EyeIcon />
      )}
    </button>
  );
}
