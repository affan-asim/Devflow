import { Body, Container, Head, Heading, Html, Preview, Text, Tailwind } from "@react-email/components";
import * as React from "react";

export default function CompanyJoinRequestStatusEmail({ recruiterName, companyName, status, roleTitle }) {
  const accepted = status === "ACCEPTED";
  return (
    <Html>
      <Head />
      <Preview>{accepted ? `Your request to join ${companyName} was accepted` : `Your request to join ${companyName} was declined`}</Preview>
      <Tailwind>
        <Body className="bg-[#f8fafc] my-auto mx-auto font-sans">
          <Container className="bg-white border border-solid border-[#e2e8f0] rounded-xl my-[40px] mx-auto p-[32px] w-[480px]">
            <Heading className="text-[#0f172a] text-[22px]">{accepted ? "You're joining the team" : "Request update"}</Heading>
            <Text className="text-[#475569] text-[14px] leading-[22px]">Hello {recruiterName || "Recruiter"},</Text>
            <Text className="text-[#475569] text-[14px] leading-[22px]">
              {accepted
                ? `Your request to join ${companyName} has been accepted${roleTitle ? ` as ${roleTitle}` : ""}. Your recruiter profile is now associated with the company.`
                : `The owner of ${companyName} has declined your request to join the company.`}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
