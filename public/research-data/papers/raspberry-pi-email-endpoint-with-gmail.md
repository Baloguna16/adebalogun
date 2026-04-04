# Raspberry Pi Email Endpoint: Receiving & Sending with a Whitelisted Gmail Account

**Date:** 2026-03-15
**Classification:** Technical Research Brief

---

## Executive Summary

What you want to build is **not complicated at all**. You don't need to run a mail server. You don't need a domain, DNS records, or open ports. The simplest and most reliable architecture is: **your Pi polls Gmail over IMAP, processes emails from your whitelisted sender, and replies via SMTP** — all through Gmail's own servers. The Pi is a client, not a server.

The entire thing can be built in a single Python script (~80 lines), authenticated with a Gmail App Password, run via cron every 1-2 minutes or as a systemd daemon using IMAP IDLE for near-real-time. No inbound ports need to be open on your Pi. No DNS configuration. No deliverability concerns. Gmail handles all of that.

There are three viable approaches ranked by complexity:

1. **IMAP/SMTP with App Password** (recommended) — Simplest. ~1 hour to set up. Works today, no deprecation announced.
2. **Gmail API with OAuth2** — More capable (push notifications, labels, threads). More setup (Google Cloud project, one-time browser auth). Better long-term bet.
3. **Self-hosted mail server** (Postfix/Dovecot) — Don't do this. Residential IPs are blocklisted, ISPs block port 25, deliverability is near-zero.

**Bottom line:** Go with Option 1. You can build this in an afternoon.

---

## Architecture: How It Works

```
┌─────────────┐         IMAP (poll/IDLE)         ┌──────────────┐
│  Your Gmail  │ ◄──────────────────────────────► │ Raspberry Pi │
│  Account     │         SMTP (send reply)        │ (Python)     │
└─────────────┘                                   └──────────────┘
       ▲                                                 │
       │                                                 │
  You email the Pi                               Pi processes email,
  from your whitelisted                          runs logic, replies
  Gmail address                                  back to you
```

Key design points:
- **No inbound connections.** The Pi reaches out to Gmail — nothing reaches in. No port forwarding, no dynamic DNS, no firewall changes.
- **Gmail is both mailbox and relay.** Incoming mail lands in your Gmail inbox. The Pi fetches it via IMAP. Outgoing mail is sent via Gmail's SMTP servers, so deliverability is perfect.
- **Whitelist = IMAP SEARCH filter.** You tell IMAP to only return emails `FROM "your-specific@gmail.com"`. Everything else is ignored.

---

## Option 1: IMAP/SMTP with App Password (Recommended)

### Step 1: Create a Gmail App Password

1. Enable **2-Step Verification** on your Google Account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Name it "Raspberry Pi", generate it
4. You get a **16-character password** (e.g., `abcd efgh ijkl mnop`)

App Passwords are still fully supported as of March 2026. No deprecation has been announced. IMAP is now always-on (Google removed the toggle in January 2025). ([Google Support](https://support.google.com/accounts/answer/185833?hl=en))

### Step 2: Receive Email (IMAP)

Two sub-approaches:

**A. Cron-based polling (simplest, most robust):**

```python
import imaplib
import email
from email.header import decode_header

GMAIL_USER = "your-pi-account@gmail.com"
GMAIL_PASS = "abcd efgh ijkl mnop"  # App Password
WHITELIST  = "your-personal@gmail.com"

def check_mail():
    mail = imaplib.IMAP4_SSL("imap.gmail.com", 993)
    mail.login(GMAIL_USER, GMAIL_PASS)
    mail.select("INBOX")

    # Only fetch unread emails from the whitelisted sender
    status, data = mail.search(None, f'(UNSEEN FROM "{WHITELIST}")')

    for num in data[0].split():
        _, msg_data = mail.fetch(num, "(RFC822)")
        msg = email.message_from_bytes(msg_data[0][1])
        subject = decode_header(msg["Subject"])[0][0]
        if isinstance(subject, bytes):
            subject = subject.decode()

        # Extract body
        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == "text/plain":
                    body = part.get_payload(decode=True).decode()
                    break
        else:
            body = msg.get_payload(decode=True).decode()

        # YOUR LOGIC HERE
        handle_email(subject, body)

    mail.logout()
```

Run via cron every 1-2 minutes:
```bash
*/2 * * * * /usr/bin/python3 /home/pi/check_email.py >> /home/pi/email.log 2>&1
```

**B. IMAP IDLE daemon (near-real-time):**

```bash
pip install imapclient
```

```python
import imapclient

server = imapclient.IMAPClient("imap.gmail.com", ssl=True)
server.login(GMAIL_USER, GMAIL_PASS)
server.select_folder("INBOX")

while True:
    server.idle()
    responses = server.idle_check(timeout=300)  # 5-min chunks
    server.idle_done()

    if responses:
        messages = server.search(["UNSEEN", "FROM", WHITELIST])
        for uid, data in server.fetch(messages, ["RFC822"]).items():
            # process message...
            pass
```

**IDLE caveats:**
- Gmail kills IDLE connections after **29 minutes** — renew every 10-15 min
- Gmail disconnects IMAP sessions after **~24 hours** — must reconnect
- Wi-Fi drops on Pi cause silent failures — wrap in try/except with reconnect logic
- Run as a **systemd service** with `Restart=always` for resilience

### Step 3: Send Email (SMTP)

```python
import smtplib
from email.message import EmailMessage

def send_reply(to_addr, subject, body):
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = GMAIL_USER
    msg["To"] = to_addr
    msg.set_content(body)

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(GMAIL_USER, GMAIL_PASS)
        server.send_message(msg)
```

Gmail sending limit: **500 emails/day** for personal accounts. More than enough for your use case.

### Step 4: Automate

**For cron polling** — already shown above.

**For IDLE daemon** — create `/etc/systemd/system/email-monitor.service`:
```ini
[Unit]
Description=Gmail Monitor
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=pi
ExecStart=/usr/bin/python3 /home/pi/email_daemon.py
Restart=always
RestartSec=30

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable email-monitor
sudo systemctl start email-monitor
```

---

## Option 2: Gmail API with OAuth2

More powerful but more setup. Use this if you want:
- True push notifications (no polling delay at all)
- Programmatic access to labels, threads, search operators
- Google's recommended long-term path

### Setup

1. Create a **Google Cloud project** at [console.cloud.google.com](https://console.cloud.google.com)
2. Enable the **Gmail API**
3. Create **OAuth 2.0 Client ID** (type: "Desktop app")
4. Download `credentials.json` to your Pi

### One-Time Auth (requires a browser once)

From your local machine, SSH with port forwarding:
```bash
ssh -L 8888:localhost:8888 pi@your-pi-ip
```

On the Pi, run the auth script — it opens a consent URL. Complete it in your local browser. The callback routes through the SSH tunnel. A `token.json` is saved with a **refresh token** for all future headless use.

**Important:** If your OAuth consent screen is in "Testing" mode, refresh tokens expire after **7 days**. Publish the app (even just for yourself) to get long-lived tokens.

### Receiving Email

```python
results = service.users().messages().list(
    userId="me",
    q=f"from:{WHITELIST} is:unread"
).execute()

for msg in results.get("messages", []):
    full = service.users().messages().get(
        userId="me", id=msg["id"], format="full"
    ).execute()
    # process...
```

### Push Notifications (Optional, Advanced)

Instead of polling, use **Google Cloud Pub/Sub**:
1. Create a Pub/Sub topic
2. Grant `gmail-api-push@system.gserviceaccount.com` publish rights
3. Call `users.watch()` with your topic — Gmail pushes a notification on new mail
4. Your Pi pulls from the Pub/Sub subscription

Must renew `watch()` every **7 days**. Free tier: 10GB/month.

### Rate Limits

| Operation | Cost | Per-User Limit |
|---|---|---|
| `messages.list` | 5 units | 15,000 units/min |
| `messages.get` | 5 units | = 3,000 reads/min |
| `messages.send` | 100 units | = 150 sends/min |

The Gmail API itself is **free**. No paid tier.

### Service Accounts: Don't Use Them

Service accounts **do NOT work with personal @gmail.com accounts**. They only work with Google Workspace accounts with domain-wide delegation. You must use the Desktop App OAuth2 flow. ([Google Docs](https://developers.google.com/identity/protocols/oauth2/service-account))

---

## Option 3: Self-Hosted Mail Server (Don't Do This)

For completeness, here's why running Postfix/Dovecot on the Pi as a full mail server is a bad idea for your use case:

| Problem | Detail |
|---|---|
| **Residential IPs are blocklisted** | Spamhaus PBL pre-lists all residential ranges. Gmail/Outlook will reject or spam-folder your emails. |
| **ISPs block port 25** | Most residential ISPs block outbound SMTP to prevent spam. |
| **No reverse DNS** | ISPs rarely let you set PTR records. Without matching rDNS, mail is rejected. |
| **DNS complexity** | Need MX, SPF, DKIM, DMARC records — and a domain. |
| **Security burden** | Open SMTP relay risk, spam target, requires fail2ban, ClamAV, SpamAssassin, constant patching. |
| **24/7 uptime required** | Mail servers that go offline lose mail. SD card failures are common on Pis. |

A relay setup (Postfix or msmtp forwarding through Gmail SMTP) is viable for *sending* system notifications, but for your bidirectional use case, IMAP/SMTP client mode is strictly better.

---

## Security Considerations

| Concern | Recommendation |
|---|---|
| **Credential storage** | Store App Password in a file with `chmod 600`, owned by the Pi user. Or use Python's `keyring` library with `keyrings.alt` for file-based encrypted storage on headless systems. |
| **Dedicated Gmail account** | Create a separate Gmail just for the Pi. If your script bugs out and triggers rate limits, your personal account won't get locked. |
| **Network exposure** | Zero — the Pi only makes outbound connections to `imap.gmail.com` and `smtp.gmail.com`. No ports need to be open. |
| **Whitelist enforcement** | The IMAP `SEARCH (FROM "...")` filter runs server-side on Gmail. But also validate the sender in your Python code as a defense-in-depth measure (From headers can be spoofed, though Gmail marks spoofed mail). |
| **OAuth vs App Password** | OAuth2 is more secure (no password stored, tokens can be scoped and revoked). App Passwords are simpler and have no announced deprecation. Either is fine for a personal Pi project. |

---

## Analysis: Which Option Should You Pick?

| Factor | IMAP/SMTP + App Password | Gmail API + OAuth2 |
|---|---|---|
| **Setup time** | ~30 minutes | ~2 hours |
| **Dependencies** | Python stdlib only | `google-api-python-client` (~20MB) |
| **Auth complexity** | Generate App Password in browser | Google Cloud project + one-time OAuth flow |
| **Latency** | 1-2 min (cron) or ~instant (IDLE) | ~instant (Pub/Sub) or 1-2 min (polling) |
| **Future-proofing** | App Passwords may eventually be deprecated | Google's recommended path |
| **Headless friendly** | Fully headless from the start | One-time browser interaction required |
| **Features** | Basic send/receive | Labels, threads, search, push |

**Assessment:** For the stated use case — one whitelisted Gmail sender, bidirectional email with a Pi — **IMAP/SMTP with an App Password is the right call**. It's simpler, uses zero external dependencies, is fully headless, and works today with no deprecation in sight. You can always migrate to the Gmail API later if Google forces the issue.

---

## Key Takeaways

1. **This is not complicated.** You're building a Gmail client, not a mail server. One Python script, one cron job, done.
2. **Use IMAP/SMTP through Gmail's servers.** The Pi is a client — no inbound ports, no DNS, no deliverability headaches.
3. **App Passwords are the simplest auth** and are still supported with no announced deprecation timeline. Requires 2FA on the Google account.
4. **Whitelist via IMAP SEARCH:** `(UNSEEN FROM "your@gmail.com")` filters server-side. Add a Python-side check too for defense-in-depth.
5. **Cron polling every 1-2 minutes is the most robust approach.** IMAP IDLE is faster but requires connection management, reconnection logic, and a systemd daemon.
6. **Use a dedicated Gmail account** for the Pi to isolate risk from your personal account.
7. **Do NOT self-host a mail server on a Pi.** Residential IPs are blocklisted, ISPs block port 25, and the maintenance burden is not worth it for this use case.

---

## Sources & Further Reading

**Primary Sources:**
- [Gmail IMAP/SMTP Settings — Google Developers](https://developers.google.com/workspace/gmail/imap/imap-smtp)
- [Sign in with App Passwords — Google Support](https://support.google.com/accounts/answer/185833?hl=en)
- [Gmail API Python Quickstart — Google Developers](https://developers.google.com/workspace/gmail/api/quickstart/python)
- [Gmail API Push Notifications — Google Developers](https://developers.google.com/workspace/gmail/api/guides/push)
- [Gmail API Usage Limits — Google Developers](https://developers.google.com/workspace/gmail/api/reference/quota)

**Expert Analysis:**
- [GMass: Gmail API vs IMAP](https://www.gmass.co/blog/gmail-api-vs-imap/)
- [LinNotes: msmtp with Gmail OAuth2 on Pi](https://linsnotes.com/posts/sending-email-from-raspberry-pi-using-msmtp-with-gmail-oauth2/)
- [RaspberryTips: Mail Server on Pi (and why not to)](https://raspberrytips.com/mail-server-raspberry-pi/)

**Tutorials & Guides:**
- [Random Nerd Tutorials: Pi Send Email Python SMTP](https://randomnerdtutorials.com/raspberry-pi-send-email-python-smtp-server/)
- [IMAPClient Documentation (IDLE)](https://imapclient.readthedocs.io/en/2.1.0/advanced.html)
- [howto-gmail-imap-oauth2 — GitHub](https://github.com/aler9/howto-gmail-imap-oauth2)
- [Google gmail-oauth2-tools — GitHub](https://github.com/google/gmail-oauth2-tools/blob/master/python/oauth2.py)

**Troubleshooting:**
- [Spamhaus: Bounced Emails from Residential IPs](https://www.spamhaus.org/resource-hub/deliverability/how-to-handle-bounced-emails/)
- [Fetchmail Setup for Pi](https://raspberry-projects.com/pi/software_utilities/email/fetchmail-to-receive-email)
