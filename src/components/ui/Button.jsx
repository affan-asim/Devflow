'use client';

export default function Button({
  children,
  isLoading = false,
  variant = 'accent',
  className = '',
  ...props
}) {
  const variants = {
    accent: 'df-btn df-btn-accent',
    primary: 'df-btn df-btn-primary',
    outline: 'df-btn df-btn-outline',
  };

  return (
    <button
      className={`${variants[variant] || variants.accent} ${className} cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}