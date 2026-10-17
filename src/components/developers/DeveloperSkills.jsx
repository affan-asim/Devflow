"use client";

import { motion } from "framer-motion";

export default function DeveloperSkills({ skills = [] }) {
  if (!skills.length) {
    return (
      <section>
        <SectionLabel number="02" title="Technical skills" />

        <div className="mt-8 border-y border-dashed border-[var(--df-line)] py-8">
          <p className="text-sm text-[var(--df-muted)]">
            No public skills have been added yet.
          </p>
        </div>
      </section>
    );
  }

  const groupedSkills = skills.reduce((groups, skill) => {
    const category = skill?.category || "OTHER";

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push(skill);

    return groups;
  }, {});

  return (
    <section>
      <SectionLabel number="02" title="Technical skills" />

      <div className="mt-8 border-y border-[var(--df-line)]">
        {Object.entries(groupedSkills).map(
          ([category, categorySkills], categoryIndex) => (
            <div
              key={category}
              className={`
                grid
                gap-5
                py-7
                sm:grid-cols-[150px_1fr]
                ${
                  categoryIndex !== 0
                    ? "border-t border-[var(--df-line)]"
                    : ""
                }
              `}
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-soft)]">
                  {formatValue(category)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {categorySkills.map((skill, index) => (
                  <motion.span
                    key={skill?.id || skill?.name || index}
                    initial={{ opacity: 0, y: 5 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.25,
                      delay: index * 0.03,
                    }}
                    className="
                      border
                      border-[var(--df-line)]
                      bg-[var(--df-paper-2)]
                      px-3
                      py-2
                      text-xs
                      text-[var(--df-text)]
                    "
                  >
                    {skill?.name || skill}
                  </motion.span>
                ))}
              </div>
            </div>
          )
        )}
      </div>
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
  if (!value) return "Other";

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}