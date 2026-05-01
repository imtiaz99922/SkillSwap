import React from "react";

export default function AuthInput({
  id,
  label,
  type = "text",
  register,
  registerOptions,
  error,
  className = "",
  children,
  ...props
}) {
  const inputProps = register
    ? { ...register(id, registerOptions), ...props }
    : props;

  return (
    <div className="floating-input relative">
      <input
        id={id}
        type={type}
        placeholder=" "
        className={`form-input ${className}`}
        {...inputProps}
      />
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <p className="mt-2 text-sm text-rose-300">{error.message ?? error}</p>
      ) : null}
    </div>
  );
}
