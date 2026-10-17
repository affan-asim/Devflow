'use client';

export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="df-eyebrow">{label}</label>}
      <input
        className={`w-full px-4 py-3 bg-[var(--df-paper-2)] text-[var(--df-text-strong)] text-sm 
          border border-[var(--df-line)] outline-none transition-all duration-300
          placeholder:text-[var(--df-soft)]
          focus:border-[var(--df-text-strong)] focus:bg-[var(--df-paper-3)]
          ${error ? 'border-red-500 focus:border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-[11px] text-red-500 font-medium">{error}</span>}
    </div>
  );
}
