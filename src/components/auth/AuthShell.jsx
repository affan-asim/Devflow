
"use client";

import { motion } from "framer-motion";
import AuthHeader from "./AuthHeader";

export default function AuthShell({
  children,
  eyebrow,
  title,
  description,
  sideTitle,
  sideDescription,
  sideItems = [],
}) {
  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <AuthHeader />

      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-[1320px] lg:grid-cols-[1.05fr_0.95fr]">
        {/* Main */}
        <div className="flex items-center border-b border-[var(--df-line)] px-5 py-16 sm:px-8 lg:border-b-0 lg:border-r lg:px-16 lg:py-20">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
            className="mx-auto w-full max-w-[520px]"
          >
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--df-muted)]">
                {eyebrow}
              </p>
            )}

            <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
              {title}
            </h1>

            {description && (
              <p className="mt-6 max-w-md text-sm leading-6 text-[var(--df-muted)] sm:text-base">
                {description}
              </p>
            )}

            <div className="mt-10">
              {children}
            </div>
          </motion.div>
        </div>

        {/* Editorial side */}
        <aside className="relative hidden overflow-hidden bg-[var(--df-paper-2)] lg:flex">
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "linear-gradient(var(--df-line-soft) 1px, transparent 1px), linear-gradient(90deg, var(--df-line-soft) 1px, transparent 1px)",
              backgroundSize: "52px 52px",
            }}
          />

          <div className="relative flex w-full flex-col justify-between p-12 xl:p-16">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--df-muted)]">
                DEVFLOW / ACCESS
              </p>

              <h2 className="mt-8 max-w-md text-4xl font-semibold leading-[0.95] tracking-[-0.045em] xl:text-5xl">
                {sideTitle}
              </h2>

              <p className="mt-6 max-w-md text-sm leading-6 text-[var(--df-muted)]">
                {sideDescription}
              </p>
            </div>

            <div className="mt-16">
              <div className="border-t border-[var(--df-line)]">
                {sideItems.map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{
                      opacity: 0,
                      x: 15,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      duration: 0.5,
                      delay: 0.2 + index * 0.08,
                    }}
                    className="flex items-center gap-4 border-b border-[var(--df-line)] py-5"
                  >
                    <span className="text-[10px] tracking-[0.15em] text-[var(--df-soft)]">
                      0{index + 1}
                    </span>

                    <span className="text-sm font-medium">
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-12 flex items-end justify-between">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--df-soft)]">
                Developer hiring network
              </p>

              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--df-line)]">
                <div className="h-2 w-2 rounded-full bg-[var(--df-accent)]" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}