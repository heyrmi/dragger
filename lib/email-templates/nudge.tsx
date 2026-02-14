export function nudgeEmailHtml({
  recipientName,
  senderName,
  message,
}: {
  recipientName: string;
  senderName: string;
  message?: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
</head>
<body style="margin:0;padding:0;background-color:#1A1A1A;font-family:Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:40px 24px;">
    <h1 style="color:#E8E0D4;font-size:24px;margin:0 0 16px;">Hey ${recipientName},</h1>
    <p style="color:#9C9488;font-size:16px;line-height:1.6;margin:0 0 8px;">
      <strong style="color:#D4A03A;">${senderName}</strong> nudged you to update!
    </p>
    ${message ? `<p style="color:#E8E0D4;font-size:14px;font-style:italic;margin:0 0 24px;">"${message}"</p>` : ""}
    <a href="${process.env.BETTER_AUTH_URL}/dashboard/log"
       style="display:inline-block;background:#D4553A;color:white;padding:12px 24px;text-decoration:none;font-weight:600;font-size:14px;">
      Update now
    </a>
    <p style="color:#9C9488;font-size:12px;margin:32px 0 0;border-top:1px solid #3A3735;padding-top:16px;">
      <a href="${process.env.BETTER_AUTH_URL}/dashboard/settings" style="color:#9C9488;">Manage notifications</a>
    </p>
  </div>
</body>
</html>`;
}
