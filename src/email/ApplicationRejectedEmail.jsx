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

export default function ApplicationRejectedEmail({
  recipientName = "there",
  companyName = "the company",
  roleTitle = "the position",
  rejectionReason,
}) {
  return (
    <Html>
      <Head />
      <Preview>Update on your application to {companyName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>DevFlow</Text>
          </Section>
          <Section style={content}>
            <Heading style={heading}>Update on your application</Heading>
            <Text style={paragraph}>Hello {recipientName},</Text>
            <Text style={paragraph}>
              Thank you for applying for <strong style={highlight}>{roleTitle}</strong> at{" "}
              <strong style={highlight}>{companyName}</strong>. The hiring team has decided not to
              move forward with your application.
            </Text>
            {rejectionReason && (
              <Text style={paragraph}>The recruiter shared this note: {rejectionReason}</Text>
            )}
            <Text style={paragraph}>
              We appreciate the time you spent applying and wish you the best in your search.
            </Text>
            <Hr style={hr} />
            <Text style={footer}>You can view your application status in your DevFlow dashboard.</Text>
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
