import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import * as React from "react";

export const CompanyVerificationEmail = ({
    name = "there",
    companyName = "your company",
    isVerified = true,
    actionUrl = "https://devflow.com/company/id",
}) => {
    const previewText = isVerified
        ? `${companyName} is officially verified.`
        : `Update regarding ${companyName}'s verification status.`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Brand/Logo Accent Header */}
                    <Section style={header}>
                        <Text style={logoText}>DevFlow</Text>
                    </Section>

                    <Section style={content}>
                        <Heading style={heading}>
                            {isVerified ? "Company verified." : "Verification revorked"}
                        </Heading>

                        <Text style={paragraph}>Hey {name},</Text>

                        {isVerified ? (
                            <>
                                <Text style={paragraph}>
                                    <strong style={highlight}>{companyName}</strong> has been officially verified on our platform. Your profile now carries the verified badge, giving your listing full visibility and instant trust with candidates and clients.
                                </Text>

                                <Section style={btnContainer}>
                                    <Button style={button} href={actionUrl}>
                                        Go to Dashboard &rarr;
                                    </Button>
                                </Section>
                            </>
                        ) : (
                            <>
                                <Text style={paragraph}>
                                    We reviewed the verification application for{" "}
                                    <strong style={highlight}>{companyName}</strong>, but we couldn't confirm your details with the provided information.
                                </Text>

                                <Text style={paragraph}>
                                    This usually happens due to mismatched domain records or missing business documents. You can update your submission details anytime.
                                </Text>

                                <Section style={btnContainer}>
                                    <Button style={secondaryButton} href={`${actionUrl}/verification`}>
                                        Review & Fix Details
                                    </Button>
                                </Section>
                            </>
                        )}

                        <Hr style={hr} />

                        <Text style={footer}>
                            Questions? Just reply directly to this email—we read every message.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default CompanyVerificationEmail;

// --- Aesthetic Modern Dark/Clean Styles ---
const main = {
    backgroundColor: "#09090b", // Deep dark background
    fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
};

const container = {
    margin: "0 auto",
    padding: "40px 20px",
    maxWidth: "560px",
};

const header = {
    paddingBottom: "24px",
};

const logoText = {
    fontSize: "18px",
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: "-0.5px",
    margin: "0",
};

const content = {
    backgroundColor: "#18181b", // Sleek card surface
    borderRadius: "12px",
    border: "1px solid #27272a",
    padding: "40px 32px",
};

const heading = {
    fontSize: "24px",
    fontWeight: "600",
    color: "#ffffff",
    letterSpacing: "-0.5px",
    marginTop: "0",
    marginBottom: "24px",
};

const paragraph = {
    fontSize: "15px",
    lineHeight: "24px",
    color: "#a1a1aa",
    marginBottom: "16px",
};

const highlight = {
    color: "#ffffff",
    fontWeight: "600",
};

const btnContainer = {
    marginTop: "28px",
    marginBottom: "28px",
};

const button = {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    color: "#09090b",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    textAlign: "center",
    display: "inline-block",
    padding: "12px 24px",
};

const secondaryButton = {
    backgroundColor: "#27272a",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    textAlign: "center",
    display: "inline-block",
    padding: "12px 24px",
    border: "1px solid #3f3f46",
};

const hr = {
    borderColor: "#27272a",
    margin: "28px 0",
};

const footer = {
    fontSize: "13px",
    color: "#71717a",
    margin: "0",
};