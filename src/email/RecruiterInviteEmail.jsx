import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
    Tailwind,
} from "@react-email/components";
import * as React from "react";

export const RecruiterInviteEmail = ({
    recruiterName = "Recruiter",
    inviterName = "The Hiring Team",
    companyName = "DevFlow",
    roleTitle = "Senior Technical Recruiter",
    employmentType = "FULL_TIME",
    salary,
    currency = "USD",
    description,
    expiresAt,
    inviteLink = "https://yourdomain.com/invites/accept",
}) => {
    const formattedSalary = salary
        ? `${currency || "$"} ${Number(salary).toLocaleString()}`
        : "Not specified";

    const formattedType = employmentType
        ? employmentType.replace(/_/g, " ")
        : "Not specified";

    const formattedExpiration = expiresAt
        ? new Date(expiresAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
          })
        : "24 hours";

    return (
        <Html>
            <Head />
            <Preview>Invitation to join {companyName} as a Recruiter</Preview>
            <Tailwind>
                <Body className="bg-[#f8fafc] my-auto mx-auto font-sans antialiased">
                    <Container className="border border-solid border-[#e2e8f0] rounded-2xl my-[40px] mx-auto p-[32px] w-[480px] bg-white shadow-sm">
                        
                        {/* Brand Logo / Badge */}
                        <Section className="mb-6">
                            <Text className="text-[12px] font-bold tracking-widest uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full inline-block m-0">
                                Official Invitation
                            </Text>
                        </Section>

                        {/* Title Section (Fixed Markdown bug) */}
                        <Heading className="text-[#0f172a] text-[22px] font-semibold tracking-tight p-0 my-0 mb-3">
                            Join <span className="text-indigo-600">{companyName}</span>
                        </Heading>

                        <Text className="text-[#475569] text-[14px] leading-[22px] my-0 mb-4">
                            Hello <strong className="text-[#0f172a]">{recruiterName}</strong>,
                        </Text>

                        <Text className="text-[#475569] text-[14px] leading-[22px] my-0 mb-6">
                            <strong className="text-[#0f172a]">{inviterName}</strong> has invited you to join <strong className="text-[#0f172a]">{companyName}</strong> as a recruiter. Review your offer details below:
                        </Text>

                        {/* Offer Details Grid Card */}
                        <Section className="bg-[#f8fafc] rounded-xl p-4 my-6 border border-solid border-[#e2e8f0]">
                            <Text className="text-[#64748b] text-[11px] font-bold uppercase tracking-wider my-0 mb-3">
                                Position & Offer Summary
                            </Text>
                            
                            <table className="w-full text-left border-collapse">
                                <tbody>
                                    <tr className="border-b border-solid border-[#e2e8f0]">
                                        <td className="py-2 text-[13px] text-[#64748b] font-medium w-1/3">Role</td>
                                        <td className="py-2 text-[13px] text-[#0f172a] font-semibold">{roleTitle}</td>
                                    </tr>
                                    <tr className="border-b border-solid border-[#e2e8f0]">
                                        <td className="py-2 text-[13px] text-[#64748b] font-medium">Type</td>
                                        <td className="py-2 text-[13px] text-[#0f172a] font-semibold capitalize">{formattedType.toLowerCase()}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 text-[13px] text-[#64748b] font-medium">Compensation</td>
                                        <td className="py-2 text-[13px] text-[#0f172a] font-semibold">{formattedSalary}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </Section>

                        {/* Description Section */}
                        {description && (
                            <Section className="my-6">
                                <Text className="text-[#64748b] text-[11px] font-bold uppercase tracking-wider my-0 mb-2">
                                    Role Overview
                                </Text>
                                <Text className="text-[#334155] text-[13px] leading-[20px] bg-[#f1f5f9] p-3 rounded-lg border-l-4 border-indigo-500 m-0">
                                    "{description}"
                                </Text>
                            </Section>
                        )}

                        {/* CTA Button */}
                        <Section className="text-center my-[28px]">
                            <Button
                                className="bg-[#0f172a] rounded-xl text-white text-[13px] font-semibold no-underline text-center px-7 py-3.5 shadow-md block"
                                href={inviteLink}
                            >
                                Accept Invitation & Register
                            </Button>
                        </Section>

                        <Text className="text-[#94a3b8] text-[12px] leading-[18px] text-center my-0 mb-6">
                            This link expires on <strong className="text-[#64748b]">{formattedExpiration}</strong>.
                        </Text>

                        <Hr className="border border-solid border-[#f1f5f9] my-6 mx-0 w-full" />

                        <Text className="text-[#94a3b8] text-[12px] leading-[18px] my-0">
                            If you were not expecting this invitation, you can safely ignore this email.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default RecruiterInviteEmail;