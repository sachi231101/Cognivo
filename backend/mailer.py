"""Resend email sending for Cognivo (invite emails)."""
import asyncio
import logging
import os
from pathlib import Path

import resend
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

logger = logging.getLogger("cognivo.mailer")

RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
APP_NAME = os.environ.get("APP_NAME", "Cognivo")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


def _invite_html(invite_link: str, company_name: str, inviter_name: str) -> str:
    return f"""
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:'IBM Plex Sans',Helvetica,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8fafc;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;max-width:560px;width:100%;">
            <tr>
              <td style="padding:32px 36px 8px 36px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="vertical-align:middle;">
                      <img src="https://customer-assets.emergentagent.com/job_brain-workspace-4/artifacts/f41c0a1a_congnivo.png" width="40" height="40" alt="{APP_NAME}" style="border-radius:50%;display:block;" />
                    </td>
                    <td style="vertical-align:middle;padding-left:10px;font-size:18px;font-weight:600;letter-spacing:-0.01em;">
                      {APP_NAME}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 36px 8px 36px;">
                <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#64748b;font-weight:600;">Invitation</div>
                <h1 style="margin:10px 0 0 0;font-size:24px;line-height:1.25;font-weight:700;letter-spacing:-0.02em;color:#0f172a;">
                  You're invited to join {company_name} on {APP_NAME}
                </h1>
                <p style="margin:16px 0 0 0;font-size:15px;line-height:1.6;color:#475569;">
                  <strong>{inviter_name}</strong> has invited you to join the {company_name} workspace on {APP_NAME} — your team's internal AI assistant powered by your own company knowledge.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 36px;">
                <a href="{invite_link}" style="display:inline-block;background:#1E3A8A;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 28px;border-radius:8px;">
                  Accept invitation →
                </a>
                <p style="margin:18px 0 0 0;font-size:13px;color:#64748b;line-height:1.5;">
                  Or paste this link into your browser:<br />
                  <span style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#475569;word-break:break-all;">{invite_link}</span>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 36px 28px 36px;">
                <div style="border-top:1px solid #e2e8f0;padding-top:18px;font-size:12px;color:#94a3b8;line-height:1.5;">
                  {APP_NAME} is an internal AI knowledge assistant. Your workspace data stays isolated to {company_name} — never shared or mixed with other tenants.<br/>
                  If you weren't expecting this invitation, you can safely ignore this email.
                </div>
              </td>
            </tr>
          </table>
          <div style="font-size:11px;color:#94a3b8;margin-top:14px;">© {APP_NAME}</div>
        </td>
      </tr>
    </table>
  </body>
</html>
"""


async def send_invite_email(
    to_email: str, invite_link: str, company_name: str, inviter_name: str
) -> dict:
    """Send invitation email. Returns dict with status."""
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set — skipping email send")
        return {"sent": False, "reason": "no api key"}

    params = {
        "from": f"{APP_NAME} <{SENDER_EMAIL}>",
        "to": [to_email],
        "subject": f"You're invited to join {company_name} on {APP_NAME}",
        "html": _invite_html(invite_link, company_name, inviter_name),
    }
    try:
        result = await asyncio.to_thread(resend.Emails.send, params)
        email_id = result.get("id") if isinstance(result, dict) else getattr(result, "id", None)
        logger.info(f"Invite email sent to {to_email} (id={email_id})")
        return {"sent": True, "id": email_id}
    except Exception as e:
        logger.exception(f"Resend send failed: {e}")
        return {"sent": False, "error": str(e)}
