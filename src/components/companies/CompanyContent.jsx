import {
    ArrowUpRight,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    CheckCircle2,
    MapPin,
    Users,
  } from "lucide-react";
  
  import {
    CompanyMeta,
    formatDate,
    formatText,
    getOpenJobCount,
    getRecruiterCount,
    SectionLabel,
  } from "./CompanyHelpers";
  
  import { CompanyJobs } from "./CompanyJobs";
  import { CompanyStats } from "./CompanyStats";
  import { CompanyHistory } from "./CompanyHistory";
import { CompanyTeam } from "./CompanyTeam";
  
  export function CompanyContent({ company }) {
    const recruiterCount = getRecruiterCount(company);
    const openJobs = getOpenJobCount(company);
  
    return (
      <section>
        <div className="mx-auto grid max-w-[1320px] lg:grid-cols-[1fr_340px]">
  
          {/* Main content */}
          <div className="px-5 py-16 sm:px-8 lg:border-r lg:border-[var(--df-line)] lg:px-12 lg:py-20">
  
            {/* ABOUT */}
            <section>
              <SectionLabel
                number="01"
                title="About the company"
              />
  
              <div className="mt-8 max-w-3xl">
                <p className="text-[15px] leading-8 text-[var(--df-muted)]">
                  {company.name} is a{" "}
                  {company.industry
                    ? formatText(company.industry).toLowerCase()
                    : "company"}{" "}
                  based in{" "}
                  {company.country
                    ? formatText(company.country)
                    : "an unspecified location"}
                  . The company currently has{" "}
                  {openJobs} open{" "}
                  {openJobs === 1 ? "opportunity" : "opportunities"}{" "}
                  available through DevFlow.
                </p>
  
                <p className="mt-5 text-[15px] leading-8 text-[var(--df-muted)]">
                  {company.isVerified
                    ? "This organization has a verified company profile on DevFlow."
                    : "This organization currently has an unverified company profile on DevFlow."}
                </p>
              </div>
  
              <CompanyStats company={company} />
            </section>
  
            {/* OPEN JOBS */}
            <section
              id="open-roles"
              className="mt-20 border-t border-[var(--df-line)] pt-12"
            >
              <SectionLabel
                number="02"
                title="Open opportunities"
              />
  
              <CompanyJobs company={company} />
            </section>
  
            {/* TEAM */}
            <section
              id="recruiting-team"
              className="mt-20 border-t border-[var(--df-line)] pt-12"
            >
              <SectionLabel
                number="03"
                title="Recruiting team"
              />
  
              <div className="mt-3 flex items-end justify-between gap-6">
                <p className="max-w-xl text-sm leading-6 text-[var(--df-muted)]">
                  People responsible for recruiting and representing this
                  organization on DevFlow.
                </p>
  
                <span className="hidden text-xs text-[var(--df-soft)] sm:block">
                  {recruiterCount}{" "}
                  {recruiterCount === 1 ? "member" : "members"}
                </span>
              </div>
  
              <CompanyTeam company={company} />
            </section>
  
            {/* HISTORY */}
            <section
              id="company-history"
              className="mt-20 border-t border-[var(--df-line)] pt-12"
            >
              <SectionLabel
                number="04"
                title="People & experience"
              />
  
              <div className="mt-3 max-w-xl">
                <p className="text-sm leading-6 text-[var(--df-muted)]">
                  Roles and professional history connected to this organization
                  through DevFlow.
                </p>
              </div>
  
              <CompanyHistory company={company} />
            </section>
          </div>
  
          {/* SIDEBAR */}
          <aside className="border-t border-[var(--df-line)] lg:border-t-0">
            <div className="sticky top-0 p-5 sm:p-8 lg:p-10">
  
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--df-muted)]">
                Company information
              </p>
  
              <div className="mt-7">
  
                <CompanyMeta
                  icon={Building2}
                  label="Industry"
                  value={formatText(company.industry)}
                />
  
                <CompanyMeta
                  icon={MapPin}
                  label="Country"
                  value={formatText(company.country)}
                />
  
                <CompanyMeta
                  icon={BriefcaseBusiness}
                  label="Open roles"
                  value={`${openJobs} ${
                    openJobs === 1 ? "opportunity" : "opportunities"
                  }`}
                />
  
                <CompanyMeta
                  icon={Users}
                  label="Recruiting team"
                  value={`${recruiterCount} ${
                    recruiterCount === 1 ? "member" : "members"
                  }`}
                />
  
                <CompanyMeta
                  icon={CheckCircle2}
                  label="Verification"
                  value={
                    company.isVerified
                      ? "Verified company"
                      : "Not verified"
                  }
                />
  
                <CompanyMeta
                  icon={CalendarDays}
                  label="Joined DevFlow"
                  value={formatDate(company.createdAt)}
                />
              </div>
  
              {company.websiteUrl && (
                <a
                  href={company.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 flex h-12 items-center justify-center gap-2 bg-[var(--df-text)] text-xs font-semibold text-[var(--df-paper)] transition hover:opacity-90"
                >
                  Visit company website
                  <ArrowUpRight size={14} />
                </a>
              )}
  
              <div className="mt-8 border-t border-[var(--df-line)] pt-7">
                <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--df-soft)]">
                  On DevFlow
                </p>
  
                <p className="mt-2 text-sm leading-6 text-[var(--df-muted)]">
                  Explore this company's opportunities, recruiting team, and
                  professional activity connected to the organization.
                </p>
              </div>
  
              {/* Quick navigation */}
              <div className="mt-8 border-t border-[var(--df-line)] pt-7">
                <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--df-soft)]">
                  Explore
                </p>
  
                <nav className="mt-4 space-y-1">
                  <a
                    href="#open-roles"
                    className="group flex items-center justify-between py-2 text-sm text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
                  >
                    Open opportunities
                    <ArrowUpRight
                      size={13}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </a>
  
                  <a
                    href="#recruiting-team"
                    className="group flex items-center justify-between py-2 text-sm text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
                  >
                    Recruiting team
                    <ArrowUpRight
                      size={13}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </a>
  
                  <a
                    href="#company-history"
                    className="group flex items-center justify-between py-2 text-sm text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
                  >
                    People & experience
                    <ArrowUpRight
                      size={13}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </a>
                </nav>
              </div>
            </div>
          </aside>
        </div>
      </section>
    );
  }