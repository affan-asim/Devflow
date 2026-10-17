const trends = [
    {
      skill: "React",
      category: "Frontend",
      change: "+12%",
      signal: "High",
    },
    {
      skill: "TypeScript",
      category: "Language",
      change: "+9%",
      signal: "High",
    },
    {
      skill: "PostgreSQL",
      category: "Database",
      change: "+7%",
      signal: "Growing",
    },
    {
      skill: "Redis",
      category: "Backend",
      change: "+6%",
      signal: "Growing",
    },
    {
      skill: "Next.js",
      category: "Framework",
      change: "+5%",
      signal: "Stable",
    },
  ];
  
  export default function DevFlowIndex() {
    return (
      <section>
        <div className="df-container py-24 lg:py-36">
          <div className="grid grid-cols-12 gap-12 lg:gap-8">
            {/* Intro */}
            <div className="col-span-12 lg:col-span-5">
              <p className="df-eyebrow">
                05 / DevFlow index
              </p>
  
              <h2 className="df-section-title mt-7 max-w-xl text-[clamp(3rem,5vw,5.5rem)]">
                See where the ecosystem is moving.
              </h2>
  
              <p className="mt-8 max-w-md text-sm leading-6 text-[var(--df-muted)]">
                The hiring market leaves signals everywhere.
                DevFlow turns those signals into useful context
                for developers and teams.
              </p>
            </div>
  
            {/* Index */}
            <div className="col-span-12 lg:col-span-7">
              <div className="border-y border-[var(--df-line)]">
                <div className="grid grid-cols-12 border-b border-[var(--df-line-soft)] py-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--df-soft)]">
                  <div className="col-span-6">
                    Skill
                  </div>
  
                  <div className="col-span-2">
                    Area
                  </div>
  
                  <div className="col-span-2 text-right">
                    Change
                  </div>
  
                  <div className="col-span-2 text-right">
                    Signal
                  </div>
                </div>
  
                {trends.map((item, index) => (
                  <div
                    key={item.skill}
                    className="group grid grid-cols-12 items-center border-b border-[var(--df-line-soft)] py-6 last:border-b-0"
                  >
                    <div className="col-span-6 flex items-center gap-4">
                      <span className="df-number">
                        0{index + 1}
                      </span>
  
                      <span className="text-lg font-medium tracking-[-0.03em]">
                        {item.skill}
                      </span>
                    </div>
  
                    <div className="col-span-2 text-[11px] text-[var(--df-muted)]">
                      {item.category}
                    </div>
  
                    <div className="col-span-2 text-right text-xs font-medium">
                      {item.change}
                    </div>
  
                    <div className="col-span-2 text-right">
                      <span
                        className={`text-[9px] font-semibold uppercase tracking-[0.12em] ${
                          item.signal === "High"
                            ? "text-[#79a53a]"
                            : "text-[var(--df-muted)]"
                        }`}
                      >
                        {item.signal}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
  
              <p className="mt-4 text-[9px] uppercase tracking-[0.16em] text-[var(--df-soft)]">
                Index data becomes meaningful when connected to
                real platform activity.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }