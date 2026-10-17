
"use client";

export default function AuthInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-[var(--df-text)]">
        {label}
      </span>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="h-12 w-full border border-[var(--df-line)] bg-[var(--df-paper)] px-4 text-sm text-[var(--df-text)] outline-none transition placeholder:text-[var(--df-soft)] focus:border-[var(--df-text)] focus:ring-1 focus:ring-[var(--df-text)]"
      />
    </label>
  );
}
