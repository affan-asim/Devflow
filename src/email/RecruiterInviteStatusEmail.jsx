import { Body, Container, Head, Heading, Html, Preview, Text, Tailwind } from "@react-email/components";
import * as React from "react";

export default function RecruiterInviteStatusEmail({ ownerName, recruiterName, companyName, status, roleTitle }) {
  const accepted = status === "ACCEPTED";
  return (
    <Html>
      <Head />
      <Preview>{recruiterName} {accepted ? "accepted" : "declined"} your invitation to {companyName}</Preview>
      <Tailwind>
        <Body className="bg-[#f8fafc] my-auto mx-auto font-sans">
          <Container className="bg-white border border-solid border-[#e2e8f0] rounded-xl my-[40px] mx-auto p-[32px] w-[480px]">
            <Heading className="text-[#0f172a] text-[22px]">{accepted ? "Invitation accepted" : "Invitation declined"}</Heading>
            <Text className="text-[#475569] text-[14px] leading-[22px]">Hello {ownerName || "there"},</Text>
            <Text className="text-[#475569] text-[14px] leading-[22px]">
              {recruiterName || "The recruiter"} {accepted ? "accepted" : "declined"} your invitation to join {companyName}
              {roleTitle ? ` as ${roleTitle}` : ""}.
              {accepted ? " They are now associated with your company on DevFlow." : " You can contact them if you would like to discuss the role."}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
