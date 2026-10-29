# Contact form

The GitHub Pages contact form posts directly from the browser to Web3Forms.
Its new public access key is configured in `index.html`; this is a public
form identifier, not an account password. Never add the account's private key
to this repository.

The email subject stays **New message from portfolio site**. The visitor's
email is the Reply-To address, and `inquiry_subject` preserves their subject.
The usual and personal thank-you redirects remain in `js/contact.js`.

## Account configuration

Created the new **Tunahan Dilercan Portfolio** form on October 29, 2026,
for `https://www.tunahandilercan.com.tr/`. The destination is the owner's
Gmail address. The new public access key is in `index.html`.

Enabled **hCaptcha** in the form's security settings and verified that the
selection persisted after reloading the dashboard. Advanced Spam Filter
remains enabled. The site uses Web3Forms' documented public hCaptcha sitekey.

This dashboard setting makes CAPTCHA mandatory on the provider's server.
A checkbox on the website or a client-side check alone cannot stop direct
API requests. The missing-token and successful-delivery checks against the
live provider still need to be completed when publishing the updated site.

## CAPTCHA presentation

The widget uses invisible mode. Verification starts after a valid form is
submitted; only a small hCaptcha disclosure appears in the layout. A visual
challenge can still be shown when hCaptcha requires one. Invisible mode does
not guarantee fewer image questions. Server-side hCaptcha enforcement stays
enabled.

## Validation

Run `node --test tests/*.test.cjs`.

On the deployed HTTPS site, complete hCaptcha yourself, submit a test message,
and confirm both the thank-you redirect and receipt in the destination inbox.
Do not use hCaptcha's always-pass testing keys on the public website. Check
the provider dashboard for the new form's status and remaining quota.

If the service rejects the message, the form displays an error and preserves
the text. Each attempted send consumes or resets the CAPTCHA token, so retry
requires a fresh verification. The mail-app button remains available if the
CAPTCHA or provider cannot be reached.

References:
- https://docs.web3forms.com/getting-started/api-reference
- https://docs.web3forms.com/getting-started/customizations/spam-protection/hcaptcha
