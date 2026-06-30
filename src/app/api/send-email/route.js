import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { to, subject, html, from, replyTo, name, message, type } = body;

    if (!to || !subject) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject" },
        { status: 400 }
      );
    }

    let emailHtml = html;

    // Auto-generate HTML for contact form submissions
    if (!html && type === "contact") {
      emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>${subject}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f7f7f4; margin: 0; padding: 0; }
              .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border: 1px solid #e6e5e0; border-radius: 12px; overflow: hidden; }
              .header { background: linear-gradient(135deg, #1a0533 0%, #0d1a2e 50%, #0a2a1a 100%); padding: 36px 32px; text-align: center; }
              .header-icon { width: 48px; height: 48px; background: rgba(99, 102, 241, 0.2); border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 12px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; }
              .header h1 { color: #ffffff; font-size: 20px; font-weight: 600; margin: 0; letter-spacing: -0.02em; }
              .header p { color: rgba(255,255,255,0.55); font-size: 12px; margin: 6px 0 0; text-transform: uppercase; letter-spacing: 0.08em; }
              .body { padding: 32px; }
              .field { margin-bottom: 20px; }
              .field-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9b8fa0; margin-bottom: 6px; }
              .field-value { font-size: 14px; color: #26251e; background: #f7f7f4; border: 1px solid #e6e5e0; border-radius: 8px; padding: 12px 14px; }
              .message-value { font-size: 14px; color: #26251e; background: #f7f7f4; border: 1px solid #e6e5e0; border-radius: 8px; padding: 14px; line-height: 1.6; white-space: pre-wrap; }
              .footer { border-top: 1px solid #e6e5e0; padding: 20px 32px; text-align: center; }
              .footer p { font-size: 10px; color: #a09e95; text-transform: uppercase; letter-spacing: 0.06em; margin: 0; }
              .badge { display: inline-block; background: #f54e00; color: #fff; font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="wrapper">
              <div class="header">
                <h1>Digital Marketing Console</h1>
                <p>New Contact Message</p>
              </div>
              <div class="body">
                <div class="badge">New Message</div>
                <div class="field">
                  <div class="field-label">From</div>
                  <div class="field-value">${name || "Anonymous"}</div>
                </div>
                <div class="field">
                  <div class="field-label">Email</div>
                  <div class="field-value">${replyTo || from || "N/A"}</div>
                </div>
                <div class="field">
                  <div class="field-label">Subject</div>
                  <div class="field-value">${subject}</div>
                </div>
                <div class="field">
                  <div class="field-label">Message</div>
                  <div class="message-value">${message || "No message provided."}</div>
                </div>
              </div>
              <div class="footer">
                <p>Digital Marketing Console &copy; ${new Date().getFullYear()} &mdash; Sent via Resend</p>
              </div>
            </div>
          </body>
        </html>
      `;
    }

    const emailOptions = {
      from: from || process.env.RESEND_FROM_EMAIL || "Digital Marketing Console <onboarding@resend.dev>",
      to: Array.isArray(to) ? to : [to],
      subject,
      html: emailHtml,
    };

    if (replyTo) {
      emailOptions.replyTo = replyTo;
    }

    const { data, error } = await resend.emails.send(emailOptions);

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: data?.id }, { status: 200 });
  } catch (err) {
    console.error("Email send failed:", err);
    return NextResponse.json(
      { error: err.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
