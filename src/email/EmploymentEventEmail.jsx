import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export default function EmploymentEventEmail({
  recipientName = "there",
  subjectName = "your employment",
  companyName = "your company",
  eventType = "terminated",
  reason,
  letterUrl,
}) {
  const isResignation = eventType === "resigned";
  const isResignationApproved = eventType === "resignation-approved";
  const preview = isResignation
    ? `${subjectName} has submitted a resignation from ${companyName}.`
    : isResignationApproved
      ? `Your resignation from ${companyName} has been approved.`
      : `Your employment with ${companyName} has ended.`;

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>DevFlow</Text>
          </Section>
          <Section style={content}>
            <Heading style={heading}>
              {isResignation ? "Resignation submitted" : isResignationApproved ? "Resignation approved" : "Employment ended"}
            </Heading>
            <Text style={paragraph}>Hello {recipientName},</Text>
            <Text style={paragraph}>
              {isResignation ? (
                <><strong style={highlight}>{subjectName}</strong> has submitted a resignation from <strong style={highlight}>{companyName}</strong>.</>
              ) : isResignationApproved ? (
                <>Your resignation from <strong style={highlight}>{companyName}</strong> has been approved.</>
              ) : (
                <>Your employment with <strong style={highlight}>{companyName}</strong> has ended.</>
              )}
            </Text>
            {reason && (
              <Section style={reasonBox}>
                <Text style={reasonLabel}>Reason provided</Text>
                <Text style={paragraph}>{reason}</Text>
              </Section>
            )}
            {letterUrl && (
              <Section style={letterBox}>
                <Text style={reasonLabel}>Supporting letter</Text>
                <Text style={paragraph}>
                  <a href={letterUrl} style={letterLink}>View or download the termination letter</a>
                </Text>
              </Section>
            )}
            <Hr style={hr} />
            <Text style={footer}>You can review the event details in your DevFlow dashboard.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: "#09090b", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' };
const container = { margin: "0 auto", padding: "40px 20px", maxWidth: "560px" };
const header = { paddingBottom: "24px" };
const logo = { fontSize: "18px", fontWeight: "700", color: "#ffffff", margin: "0" };
const content = { backgroundColor: "#18181b", borderRadius: "12px", border: "1px solid #27272a", padding: "40px 32px" };
const heading = { fontSize: "24px", fontWeight: "600", color: "#ffffff", marginTop: "0", marginBottom: "24px" };
const paragraph = { fontSize: "15px", lineHeight: "24px", color: "#a1a1aa", marginBottom: "16px" };
const highlight = { color: "#ffffff", fontWeight: "600" };
const reasonBox = { backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "8px", padding: "16px" };
const reasonLabel = { color: "#ffffff", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" };
const letterBox = { backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "8px", padding: "16px", marginTop: "16px" };
const letterLink = { color: "#ffffff", textDecoration: "underline" };
const hr = { borderColor: "#27272a", margin: "28px 0" };
const footer = { fontSize: "13px", color: "#71717a", margin: "0" };
