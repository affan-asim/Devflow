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

export default function ApplicationAcceptedEmail({
  recipientName = "there",
  companyName = "the company",
  roleTitle = "your new role",
  startDate,
}) {
  const startDateLabel = startDate
    ? new Intl.DateTimeFormat("en", {
        dateStyle: "long",
        timeZone: "UTC",
      }).format(new Date(startDate))
    : null;

  return (
    <Html>
      <Head />
      <Preview>Congratulations! {companyName} accepted your application for {roleTitle}.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>DevFlow</Text>
          </Section>
          <Section style={content}>
            <Heading style={heading}>Congratulations on your new role</Heading>
            <Text style={paragraph}>Hello {recipientName},</Text>
            <Text style={paragraph}>
              <strong style={highlight}>{companyName}</strong> accepted your application. You have been hired as{" "}
              <strong style={highlight}>{roleTitle}</strong>.
            </Text>
            {startDateLabel && (
              <Text style={paragraph}>Your start date is {startDateLabel}.</Text>
            )}
            <Text style={paragraph}>
              You can view your employment details in your DevFlow dashboard.
            </Text>
            <Hr style={hr} />
            <Text style={footer}>We wish you success in your new role.</Text>
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
const hr = { borderColor: "#27272a", margin: "28px 0" };
const footer = { fontSize: "13px", color: "#71717a", margin: "0" };
