/* Web3Forms: require hCaptcha and preserve the message if delivery is unconfirmed. */
(function () {
    'use strict';

    const form = document.getElementById('contactForm');
    if (!form) return;

    const email = form.elements.namedItem('email');
    const subject = form.elements.namedItem('inquiry_subject');
    const message = form.elements.namedItem('message');
    const status = document.getElementById('contactStatus');
    const submit = form.querySelector('[type="submit"]');
    const mailto = document.getElementById('mailtoBtn');
    let pending = false;

    function showStatus(text) {
        status.textContent = text;
    }

    // This selects a personal animation; it is not authentication.
    function personalGreeting(address) {
        let hash = 0;
        for (const character of address.trim().toLowerCase()) {
            hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
        }
        return Math.abs(hash).toString(16).substring(0, 8) === '52bfc700';
    }

    mailto.addEventListener('click', function () {
        const body = message.value.trim() + (email.value.trim() ? '\n\nSent by: ' + email.value.trim() : '');
        window.location.href = 'mailto:tunahandilercan@gmail.com?subject=' +
            encodeURIComponent(subject.value.trim()) + '&body=' + encodeURIComponent(body);
    });

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        if (pending) return;

        email.value = email.value.trim();
        subject.value = subject.value.trim();
        message.value = message.value.trim();
        if (!form.reportValidity()) return;
        if (form.elements.namedItem('botcheck').checked) {
            showStatus('Unable to send this message. Please use the email link instead.');
            return;
        }

        const captcha = form.elements.namedItem('h-captcha-response');
        pending = true;
        submit.disabled = true;
        submit.textContent = 'Verifying...';
        form.setAttribute('aria-busy', 'true');
        showStatus('Running the security check...');

        const controller = new AbortController();
        let timeout;
        try {
            let captchaToken = captcha ? captcha.value.trim() : '';
            if (!captchaToken) {
                if (!window.hcaptcha || typeof window.hcaptcha.execute !== 'function') {
                    showStatus('The security check is still loading. Please try again or use "Send via Email App".');
                    return;
                }
                try {
                    const verification = await window.hcaptcha.execute(undefined, { async: true });
                    captchaToken = verification && verification.response;
                } catch (_) {
                    showStatus('The security check was not completed. Please try again or use "Send via Email App".');
                    return;
                }
            }
            if (typeof captchaToken !== 'string' || !captchaToken.trim()) {
                showStatus('Please complete the security check before sending.');
                return;
            }
            submit.textContent = 'Sending...';
            showStatus('Sending your message...');
            timeout = setTimeout(function () { controller.abort(); }, 20000);
            const data = new FormData(form);
            data.set('h-captcha-response', captchaToken);
            data.set('replyto', email.value);
            data.set('source_url', window.location.origin + window.location.pathname);
            // Redirect only after we have checked the JSON response ourselves.
            data.delete('redirect');
            const response = await fetch(form.action, {
                method: 'POST',
                body: data,
                headers: { Accept: 'application/json' },
                signal: controller.signal
            });
            const result = await response.json();
            if (!response.ok || !result || result.success !== true) {
                const serviceMessage = result && (result.message || (result.body && result.body.message));
                const detail = typeof serviceMessage === 'string' ? serviceMessage.slice(0, 400) : '';
                showStatus('The service did not confirm your message. ' + detail +
                    ' Your text is still here. Please try later or use “Send via Email App”.');
                return;
            }

            let destination = '/thank-you/';
            if (personalGreeting(email.value)) {
                try {
                    sessionStorage.setItem('specialAccess', 'true');
                    destination = '/special-thank-you/';
                } catch (_) { /* A blocked storage setting must not cause another send. */ }
            }
            showStatus('Your message was accepted. Thank you!');
            window.location.assign(destination);
        } catch (_) {
            showStatus('We could not confirm delivery. Your text is still here. ' +
                'Please check your connection or use “Send via Email App”.');
        } finally {
            clearTimeout(timeout);
            // Tokens are single-use. Keep the user's text, but require a fresh challenge.
            if (captcha) captcha.value = '';
            try {
                if (window.hcaptcha && typeof window.hcaptcha.reset === 'function') window.hcaptcha.reset();
            } catch (_) { /* CAPTCHA reset must not hide the delivery result. */ }
            pending = false;
            submit.disabled = false;
            submit.textContent = 'Send Message';
            form.removeAttribute('aria-busy');
        }
    });
})();
