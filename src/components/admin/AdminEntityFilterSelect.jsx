"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/lib/api/axios";
import { Search, X, ChevronDown, Loader2 } from "lucide-react";

export default function AdminEntityFilterSelect({
  endpoint,
  kind,
  label,
  value,
  onChange,
  placeholder,
  allLabel,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset page and items when search term changes
  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [search]);

  // Focus search input when opened
  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  // Fetch items from endpoint
  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setError("");

    api
      .get(endpoint, {
        params: {
          kind,
          page,
          limit: 20,
          ...(search ? { search } : {}),
        },
      })
      .then(({ data }) => {
        if (!active) return;
        const nextItems = Array.isArray(data.items) ? data.items : [];
        setItems((current) => (page === 1 ? nextItems : [...current, ...nextItems]));
        setHasNextPage(Boolean(data.pagination?.hasNextPage));

        if (value) {
          const selected = nextItems.find((item) => item.id === value);
          if (selected) setSelectedItem(selected);
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err.response?.data?.error ||
              (typeof err === "string" ? err : "Could not load options.")
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [endpoint, kind, open, page, search, value]);

  // Reset selected item if value cleared from outside
  useEffect(() => {
    if (!value) {
      setSelectedItem(null);
    }
  }, [value]);

  const defaultAllLabel = allLabel || `All ${kind}`;
  const defaultPlaceholder = placeholder || `Search ${kind}…`;

  const formatItemLabel = (item) => {
    if (!item) return "";
    if (kind === "companies") return item.name;
    if (kind === "recruiters") {
      const parts = [item.name];
      if (item.companyName) parts.push(item.companyName);
      else if (item.email) parts.push(item.email);
      return parts.join(" · ");
    }
    if (kind === "users") {
      return item.email ? `${item.name} (${item.email})` : item.name;
    }
    return item.name || item.id;
  };

  const handleSelect = (item) => {
    if (!item) {
      setSelectedItem(null);
      onChange("");
    } else {
      setSelectedItem(item);
      onChange(item.id);
    }
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedItem(null);
    onChange("");
  };

  return (
    <div ref={containerRef} className={`relative flex min-w-0 flex-col gap-1.5 ${className}`}>
      {label && (
        <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
          {label}
        </span>
      )}

      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((current) => !current);
          }
        }}
        className="flex min-h-10 min-w-0 cursor-pointer select-none items-center justify-between gap-2 border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-left text-xs text-[var(--df-text)] outline-none transition hover:border-[var(--df-muted)] focus:border-[var(--df-accent)]"
      >
        <span className="truncate">
          {value && selectedItem ? (
            <span className="font-medium text-[var(--df-text-strong)]">
              {formatItemLabel(selectedItem)}
            </span>
          ) : (
            <span className="text-[var(--df-muted)]">{defaultAllLabel}</span>
          )}
        </span>

        <div className="flex shrink-0 items-center gap-1.5">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              aria-label={`Clear ${label || kind} filter`}
              className="text-[var(--df-muted)] hover:text-[var(--df-text)]"
            >
              <X size={13} />
            </button>
          )}
          <ChevronDown
            size={14}
            className={`text-[var(--df-muted)] transition-transform duration-150 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-[280px] border border-[var(--df-line)] bg-[var(--df-paper)] shadow-xl">
          <div className="border-b border-[var(--df-line)] p-2">
            <div className="flex items-center gap-2 border border-[var(--df-line)] bg-transparent px-2.5">
              <Search size={13} className="shrink-0 text-[var(--df-muted)]" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={defaultPlaceholder}
                className="h-8 w-full bg-transparent text-xs outline-none placeholder:text-[var(--df-muted)]"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="text-[var(--df-muted)] hover:text-[var(--df-text)]"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div
            role="listbox"
            aria-label={label || kind}
            onScroll={(event) => {
              const element = event.currentTarget;
              if (
                hasNextPage &&
                !loading &&
                element.scrollTop + element.clientHeight >= element.scrollHeight - 24
              ) {
                setPage((current) => current + 1);
              }
            }}
            className="max-h-60 overflow-y-auto py-1 text-xs"
          >
            <button
              type="button"
              role="option"
              aria-selected={!value}
              onClick={() => handleSelect(null)}
              className={`block w-full px-3 py-2 text-left transition hover:bg-[var(--df-paper-2)] ${
                !value ? "font-semibold text-[var(--df-accent)]" : "text-[var(--df-muted)]"
              }`}
            >
              {defaultAllLabel}
            </button>

            {items.map((item) => {
              const isSelected = value === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(item)}
                  className={`block w-full px-3 py-2 text-left transition hover:bg-[var(--df-paper-2)] ${
                    isSelected
                      ? "bg-[var(--df-paper-2)] font-semibold text-[var(--df-text-strong)]"
                      : "text-[var(--df-text)]"
                  }`}
                >
                  <p className="truncate">{formatItemLabel(item)}</p>
                  {kind === "recruiters" && item.email && item.companyName && (
                    <p className="truncate text-[10px] text-[var(--df-muted)]">{item.email}</p>
                  )}
                  {kind === "users" && item.role && (
                    <p className="truncate text-[10px] text-[var(--df-muted)]">Role: {item.role}</p>
                  )}
                </button>
              );
            })}

            {loading && (
              <div className="flex items-center justify-center gap-2 py-3 text-xs text-[var(--df-muted)]">
                <Loader2 size={13} className="animate-spin" />
                <span>Loading more…</span>
              </div>
            )}

            {!loading && !items.length && !error && (
              <p className="px-3 py-3 text-center text-xs text-[var(--df-muted)]">
                No matching results found.
              </p>
            )}

            {error && (
              <p role="alert" className="px-3 py-2 text-xs text-rose-700 dark:text-rose-400">
                {error}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
