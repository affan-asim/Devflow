import CompanyVerificationEmail from "@/email/CompanyVerificationEmail";
import RecruiterInviteEmail from "@/email/RecruiterInviteEmail";
import EmploymentEventEmail from "@/email/EmploymentEventEmail";
import ApplicationAcceptedEmail from "@/email/ApplicationAcceptedEmail";
import ApplicationRejectedEmail from "@/email/ApplicationRejectedEmail";
import CompanyJoinRequestStatusEmail from "@/email/CompanyJoinRequestStatusEmail";
import RecruiterInviteStatusEmail from "@/email/RecruiterInviteStatusEmail";
import { VerificationOtpTemplate } from "@/email/VerificationOtpTemplate";
import { resend } from "@/utils/resend";

async function sendEmail(payload, options) {
    const response = await resend.emails.send(payload, options);

    if (response.error) {
        const { name, message, statusCode } = response.error;
        console.error("Resend rejected email:", { name, message, statusCode });
        throw new Error(`Resend rejected email: ${message}`);
    }

    console.info("Resend accepted email:", response.data.id);
    return response;
}

export async function sendVerificationEmail(email, name, otp, idempotencyKey) {
    try {
        const res = await sendEmail({
            from: 'DevFlow <onboarding@resend.dev>',
            to: ['affanasim900@gmail.com'],
            subject: 'Verify your DevFlow Account',
            react: VerificationOtpTemplate({ otp, name })
        }, {
            idempotencyKey
        })
        return res;
    } catch (error) {
        console.error("FAILED TO SEND VERIFICATION EMAIL:", error);
        throw new AppError("Failed to send verification email. Please try resending OTP.", 500);
    }
}

export async function sendVerificationCompanyEmail(name, companyName, isVerified, actionUrl, idempotencyKey) {
    const subject = isVerified
        ? `${companyName} is now verified on DevFlow`
        : `Update regarding ${companyName}'s verification on DevFlow`;

    try {
        const res = await sendEmail({
            from: 'DevFlow <onboarding@resend.dev>',
            to: ['affanasim900@gmail.com'],
            subject,
            react: CompanyVerificationEmail({ name, companyName, isVerified, actionUrl })
        }, {
            idempotencyKey
        })
        return res;
    } catch (error) {
        console.error("FAILED TO SEND VERIFICATION COMPANY EMAIL:", error);
        throw new AppError("Failed to send company verification email. Please try resending OTP.", 500);
    }
}

export async function sendInvitationEmail(email, name, invitation, idempotencyKey) {
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/company/invite/${invitation.id}`;

    try {
        const res = await sendEmail({
            from: 'DevFlow <onboarding@resend.dev>',
            to: ['affanasim900@gmail.com'],
            subject: `You've been invited to join ${invitation.company.name || 'DevFlow'} as a Recruiter`,
            react: RecruiterInviteEmail({
                recruiterName: name || "Recruiter",
                inviterName: invitation.invitedBy.user.name || "A team member",
                companyName: invitation.company.name || "DevFlow",
                roleTitle: invitation.roleTitle,
                employmentType: invitation.employmentType,
                salary: invitation.salary,
                currency: invitation.currency,
                description: invitation.description,
                expiresAt: invitation.expiresAt,
                inviteLink,
            })
        }, {
            idempotencyKey
        });

        return res;
    } catch (error) {
        console.error("FAILED TO SEND INVITATION EMAIL:", error);
        throw new AppError("Failed to send invitation email.", 500);
    }
}

export async function sendEmploymentEventEmail({
    email,
    recipientName,
    subjectName,
    companyName,
    eventType,
    reason,
    letterUrl,
    idempotencyKey,
}) {
    const isResignation = eventType === "resigned";
    const isResignationApproved = eventType === "resignation-approved";
    try {
        return await sendEmail({
            from: "DevFlow <onboarding@resend.dev>",
            to: ['affanasim900@gmail.com'],
            subject: isResignation
                ? `${subjectName} submitted a resignation from ${companyName}`
                : isResignationApproved
                    ? `Your resignation from ${companyName} was approved`
                    : `Your employment with ${companyName} has ended`,
            react: EmploymentEventEmail({ recipientName, subjectName, companyName, eventType, reason, letterUrl }),
        }, { idempotencyKey });
    } catch (error) {
        console.error("FAILED TO SEND EMPLOYMENT EVENT EMAIL:", error);
        throw new Error("Failed to send employment event email.");
    }
}

export async function sendApplicationAcceptedEmail({
    email,
    recipientName,
    companyName,
    roleTitle,
    startDate,
    idempotencyKey,
}) {
    try {
        return await sendEmail({
            from: "DevFlow <onboarding@resend.dev>",
               to: ['affanasim900@gmail.com'],
            subject: `Congratulations on your new role at ${companyName}`,
            react: ApplicationAcceptedEmail({ recipientName, companyName, roleTitle, startDate }),
        }, { idempotencyKey });
    } catch (error) {
        console.error("FAILED TO SEND APPLICATION ACCEPTANCE EMAIL:", error);
        throw new Error("Failed to send application acceptance email.");
    }
}

export async function sendApplicationRejectedEmail({
    email,
    recipientName,
    companyName,
    roleTitle,
    rejectionReason,
    idempotencyKey,
}) {
    try {
        return await sendEmail({
            from: "DevFlow <onboarding@resend.dev>",
               to: ['affanasim900@gmail.com'],
            subject: `Update on your application to ${companyName}`,
            react: ApplicationRejectedEmail({ recipientName, companyName, roleTitle, rejectionReason }),
        }, { idempotencyKey });
    } catch (error) {
        console.error("FAILED TO SEND APPLICATION REJECTION EMAIL:", error);
        throw new Error("Failed to send application rejection email.");
    }
}

export async function sendCompanyJoinRequestStatusEmail({
    email,
    recruiterName,
    companyName,
    status,
    roleTitle,
    idempotencyKey,
}) {
    const accepted = status === "ACCEPTED";
    try {
        return await sendEmail({
            from: "DevFlow <onboarding@resend.dev>",
            to: ['affanasim900@gmail.com'],
            subject: accepted ? `Your request to join ${companyName} was accepted` : `Your request to join ${companyName} was declined`,
            react: CompanyJoinRequestStatusEmail({ recruiterName, companyName, status, roleTitle }),
        }, { idempotencyKey });
    } catch (error) {
        console.error("FAILED TO SEND COMPANY JOIN REQUEST EMAIL:", error);
        throw new Error("Failed to send company join request email.");
    }
}

export async function sendRecruiterInviteStatusEmail({
    email,
    ownerName,
    recruiterName,
    companyName,
    status,
    roleTitle,
    idempotencyKey,
}) {
    const accepted = status === "ACCEPTED";
    try {
        return await sendEmail({
            from: "DevFlow <onboarding@resend.dev>",
            to: ['affanasim900@gmail.com'],
            subject: accepted
                ? `${recruiterName} accepted your invitation to ${companyName}`
                : `${recruiterName} declined your invitation to ${companyName}`,
            react: RecruiterInviteStatusEmail({ ownerName, recruiterName, companyName, status, roleTitle }),
        }, { idempotencyKey });
    } catch (error) {
        console.error("FAILED TO SEND RECRUITER INVITATION STATUS EMAIL:", error);
        throw new Error("Failed to send recruiter invitation status email.");
    }
}
