import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[Email] Would send to ${to}: ${subject}`);
    return;
  }

  await resend.emails.send({
    from: "Dragger <noreply@dragger.app>",
    to,
    subject,
    html,
  });
}
