import { EmailLogStatus, EmailType } from "@/generated/prisma";
import prisma from "@/utils/prisma";
import {
  sendApplicationAcceptedEmail,
  sendApplicationRejectedEmail,
  sendCompanyJoinRequestStatusEmail,
  sendRecruiterInviteStatusEmail,
  sendEmploymentEventEmail,
  sendInvitationEmail,
  sendVerificationCompanyEmail,
  sendVerificationEmail,
} from "../../services/auth/emailNotifications";

const emailJobTypes = {
  "send-verification-email": EmailType.SEND_VERIFICATION_EMAIL,
  "invitation-email": EmailType.INVITATION_EMAIL,
  "send-company-verification-email": EmailType.SEND_COMPANY_VERIFICATION_EMAIL,
  "employment-event-email": EmailType.EMPLOYMENT_EVENT_EMAIL,
  "application-accepted-email": EmailType.APPLICATION_ACCEPTED_EMAIL,
  "application-rejected-email": EmailType.APPLICATION_REJECTED_EMAIL,
  "company-join-request-status-email":
    EmailType.COMPANY_JOIN_REQUEST_STATUS_EMAIL,
  "recruiter-invite-status-email": EmailType.RECRUITER_INVITE_STATUS_EMAIL,
};

async function sendJobEmail(job) {
  switch (job.name) {
    case "send-verification-email":
      return sendVerificationEmail(
        job.data.email,
        job.data.name,
        job.data.plainOtp,
        job.uuid
      );

    case "invitation-email":
      return sendInvitationEmail(
        job.data.email,
        job.data.name,
        job.data.invitation,
        job.uuid
      );

    case "send-company-verification-email":
      return sendVerificationCompanyEmail(
        job.data.name,
        job.data.companyName,
        job.data.isVerified,
        job.data?.actionUrl,
        job.uuid
      );

    case "employment-event-email":
      return sendEmploymentEventEmail({
        ...job.data,
        idempotencyKey: job.data.uuid || job.id,
      });

    case "application-accepted-email":
      return sendApplicationAcceptedEmail({
        ...job.data,
        idempotencyKey: job.data.uuid || job.id,
      });

    case "application-rejected-email":
      return sendApplicationRejectedEmail({
        ...job.data,
        idempotencyKey: job.data.uuid || job.id,
      });

    case "company-join-request-status-email":
      return sendCompanyJoinRequestStatusEmail({
        ...job.data,
        idempotencyKey: job.data.uuid || job.id,
      });

    case "recruiter-invite-status-email":
      return sendRecruiterInviteStatusEmail({
        ...job.data,
        idempotencyKey: job.data.uuid || job.id,
      });

    default:
      throw new Error(`Unknown Email job: ${job.name}`);
  }
}

export async function processEmail(job) {
  const type = emailJobTypes[job.name];
  if (!type) {
    throw new Error(`Unknown Email job: ${job.name}`);
  }

  const email = job.data?.email;
  if (!email) {
    throw new Error(`Email address is missing for job: ${job.name}`);
  }

  // Create the log before contacting the email provider so every send attempt
  // has a durable record before it can be delivered.
  const emailLog = await prisma.emailLog.create({
    data: {
      email,
      type,
      status: EmailLogStatus.PENDING,
    },
  });

  try {
    const result = await sendJobEmail(job);
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: { status: EmailLogStatus.COMPLETED, errorMessage: null },
    });
    return result;
  } catch (error) {
    try {
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: EmailLogStatus.FAILED,
          errorMessage: error instanceof Error ? error.message : String(error),
        },
      });
    } catch (logError) {
      console.error("Failed to update email log status:", logError);
    }

    throw error;
  }
}
