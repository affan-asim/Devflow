import { motion } from "framer-motion";

import { getCompanyStats } from "./CompanyHelpers";

export function CompanyStats({ company }) {
  const stats = getCompanyStats(company);

  return (
    <div className="mt-10 grid border-y border-[var(--df-line)] sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.45,
              delay: index * 0.05,
            }}
            className="border-b border-[var(--df-line)] p-6 last:border-b-0 sm:nth-[2]:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[var(--df-soft)]">
                {stat.label}
              </span>

              <Icon
                size={15}
                strokeWidth={1.5}
                className="text-[var(--df-muted)]"
              />
            </div>

            <p className="mt-5 text-3xl font-semibold tracking-[-0.05em]">
              {stat.value}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}