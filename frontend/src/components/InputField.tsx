import type { ReactNode } from "react";
import type { InputError } from "../type";

function InputField({
  label,
  name,
  children,
  error,
}: {
  label?: string;
  name: string;
  children: ReactNode;
  error?: InputError | null;
}) {
  return (
    <div className="input-field">
      {label && (
        <label htmlFor={name} className="label-text">
          {label}
        </label>
      )}
      {children}
      {error?.path === name && <p className="error-text">{error.message}</p>}
    </div>
  );
}

export default InputField;
