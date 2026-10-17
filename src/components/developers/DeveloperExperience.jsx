"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function DeveloperExperience({ history = [] }) {
  return (
    <section>
      <SectionLabel number="04" title="Experience" />

      {!history.length ? (
        <div className="mt-8 border-y border-dashed border-[var(--df-line)] py-8">
          <p className="text-sm text-[var(--df-muted)]">
            No public employment history available.
          </p>
        </div>
      ) : (
        <div className="mt-8 divide-y divide-[var(--df-line)] border-y border-[var(--df-line)]">
          {history.map((item, index) => (
            <motion.article
              key={item.id || index}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.35,
                delay: Math.min(index * 0.05, 0.2),
              }}
              className="py-8"
            >
              <div className="grid gap-6 sm:grid-cols-[60px_1fr_auto]">
                {/* Number */}
                <div>
                  <span className="text-[10px] tracking-[0.15em] text-[var(--df-soft)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Main */}
                <div>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold tracking-[-0.035em] text-[var(--df-text)]">
                        {item.roleTitle || "Developer"}
                      </h3>

                      {item.isCurrent && (
                        <span
                          className="
                            border
                            border-[var(--df-line)]
                            px-2
                            py-1
                            text-[9px]
                            font-semibold
                            uppercase
                            tracking-[0.14em]
                            text-[var(--df-muted)]
                          "
                        >
                          Current
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-[var(--df-muted)]">
                      {item.company?.name ||
                        item.companyName ||
                        "Company"}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-[var(--df-muted)]">
                    {item.employmentType && (
                      <span>
                        {formatValue(item.employmentType)}
                      </span>
                    )}

                    {(item.startDate || item.endDate) && (
                      <span>
                        {formatDate(item.startDate)} —{" "}
                        {item.isCurrent
                          ? "Present"
                          : formatDate(item.endDate)}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--df-muted)]">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Salary */}
                {item.salary !== null &&
                  item.salary !== undefined && (
                    <div className="sm:text-right">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--df-soft)]">
                        Compensation
                      </p>

                      <p className="mt-2 text-sm font-medium text-[var(--df-text)]">
                        {formatSalary(
                          item.salary,
                          item.currency
                        )}
                      </p>
                    </div>
                  )}
              </div>

              {/* Company link if backend eventually provides company */}
              {item.company?.id && (
                <div className="mt-6 border-t border-[var(--df-line)] pt-4">
                  <a
                    href={`/companies/${item.company.id}`}
                    className="
                      group
                      inline-flex
                      items-center
                      gap-2
                      text-xs
                      font-medium
                      text-[var(--df-muted)]
                      transition-colors
                      hover:text-[var(--df-text)]
                    "
                  >
                    View company
                    <ArrowUpRight
                      size={13}
                      strokeWidth={1.5}
                      className="
                        transition-transform
                        group-hover:translate-x-0.5
                        group-hover:-translate-y-0.5
                      "
                    />
                  </a>
                </div>
              )}
            </motion.article>
          ))}
        </div>
      )}
    </section>
  );
}

function SectionLabel({ number, title }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-[10px] tracking-[0.16em] text-[var(--df-soft)]">
        {number}
      </span>

      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--df-text)]">
        {title}
      </span>
    </div>
  );
}

function formatValue(value) {
  if (!value) return "";

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value) {
  if (!value) return "Unknown";

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

function formatSalary(value, currency) {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return `${value} ${currency || ""}`.trim();
  }

  return `${currency ? `${currency} ` : ""}${amount.toLocaleString()}`;
}