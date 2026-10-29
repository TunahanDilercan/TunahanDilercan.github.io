const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../js/contact.js'), 'utf8');

function setup(fetchImpl, options = {}) {
    const fields = Object.fromEntries(Object.entries({
        email: 'visitor@example.com', inquiry_subject: 'A project', message: 'Hello there',
        subject: 'New message from portfolio site', access_key: '11111111-2222-4333-8444-555555555555',
        redirect: 'https://www.tunahandilercan.com.tr/thank-you/', 'h-captcha-response': 'valid-test-token'
    }).map(([name, value]) => [name, { value }]));
    fields.botcheck = { value: 'on', checked: false };
    const handlers = {};
    const status = { textContent: '' };
    const submit = { disabled: false, textContent: 'Send Message' };
    const attributes = {};
    const navigations = [];
    const requests = [];
    const timers = new Map();
    const mailto = { addEventListener: (name, handler) => { handlers.mailto = handler; } };
    const form = {
        action: 'https://api.web3forms.com/submit',
        elements: { namedItem: name => fields[name] },
        querySelector: () => submit,
        reportValidity: () => options.valid !== false,
        addEventListener: (name, handler) => { handlers[name] = handler; },
        setAttribute: (name, value) => { attributes[name] = value; },
        removeAttribute: name => { delete attributes[name]; }
    };
    class FormDataMock extends Map {
        constructor() {
            super(Object.entries(fields).filter(([key, input]) => key !== 'botcheck' || input.checked)
                .map(([key, input]) => [key, input.value]));
        }
    }
    const context = {
        document: { getElementById: id => ({ contactForm: form, contactStatus: status, mailtoBtn: mailto })[id] },
        window: { location: { origin: 'https://www.tunahandilercan.com.tr', pathname: '/', assign: url => navigations.push(url) } },
        sessionStorage: { setItem(key, value) {
            if (options.blockStorage) throw Error('Blocked');
            attributes['session:' + key] = value;
        } },
        FormData: FormDataMock, AbortController, URL,
        setTimeout(fn) { const id = timers.size + 1; timers.set(id, fn); return id; },
        clearTimeout(id) { timers.delete(id); },
        fetch: (...args) => { requests.push(args); return fetchImpl(...args); }
    };
    vm.runInNewContext(source, context);
    return { fields, status, submit, attributes, navigations, requests, timers, context,
        send: () => handlers.submit({ preventDefault() {} }), mail: () => handlers.mailto() };
}

for (const success of [true]) {
    test('redirects only for confirmed success: ' + JSON.stringify(success), async () => {
        const app = setup(async () => ({ ok: true, json: async () => ({ success }) }));
        await app.send();
        assert.deepEqual(app.navigations, ['/thank-you/']);
        assert.equal(app.requests.length, 1);
        assert.equal(app.requests[0][0], 'https://api.web3forms.com/submit');
        assert.equal(app.requests[0][1].body.get('replyto'), 'visitor@example.com');
        assert.equal(app.requests[0][1].body.get('source_url'), 'https://www.tunahandilercan.com.tr/');
        assert.equal(app.requests[0][1].body.get('subject'), 'New message from portfolio site');
        assert.equal(app.requests[0][1].body.get('inquiry_subject'), 'A project');
        assert.equal(app.requests[0][1].body.get('h-captcha-response'), 'valid-test-token');
        assert.equal(app.requests[0][1].body.has('redirect'), false);
        assert.equal(app.fields['h-captcha-response'].value, '');
    });
}

for (const success of [false, 'false', 'true', undefined]) {
    test('HTTP 200 is not delivery confirmation: ' + JSON.stringify(success), async () => {
        const app = setup(async () => ({ ok: true, json: async () => ({ success, message: 'Activation required' }) }));
        await app.send();
        assert.deepEqual(app.navigations, []);
        assert.match(app.status.textContent, /Activation required/);
        assert.equal(app.fields.message.value, 'Hello there');
        assert.equal(app.requests.length, 1);
        assert.equal(app.submit.disabled, false);
    });
}

for (const kind of ['network', 'invalid JSON', 'HTTP error']) {
    test('preserves input and allows retry after ' + kind, async () => {
        const app = setup(async () => {
            if (kind === 'network') throw Error('Disconnected');
            return { ok: kind !== 'HTTP error', json: async () => {
                if (kind === 'invalid JSON') throw Error('Unexpected HTML');
                return { success: 'true' };
            } };
        });
        await app.send();
        assert.deepEqual(app.navigations, []);
        assert.equal(app.fields.message.value, 'Hello there');
        assert.equal(app.requests.length, 1);
        assert.equal(app.submit.disabled, false);
        assert.equal(app.attributes['aria-busy'], undefined);
        assert.equal(app.timers.size, 0);
    });
}

test('double click sends one request', async () => {
    let finish;
    const app = setup(() => new Promise(resolve => { finish = resolve; }));
    const sending = app.send();
    assert.equal(app.submit.disabled, true);
    await app.send();
    assert.equal(app.requests.length, 1);
    finish({ ok: true, json: async () => ({ success: true }) });
    await sending;
});

test('timeout restores the form without a second send', async () => {
    const app = setup((url, { signal }) => new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => reject(Error('Aborted')));
    }));
    const sending = app.send();
    [...app.timers.values()][0]();
    await sending;
    assert.equal(app.submit.disabled, false);
    assert.equal(app.requests.length, 1);
    assert.deepEqual(app.navigations, []);
});

test('invalid fields and a filled honeypot never send', async () => {
    const app = setup(async () => { throw Error('Should not send'); }, { valid: false });
    await app.send();
    assert.equal(app.requests.length, 0);
    const bot = setup(async () => { throw Error('Should not send'); });
    bot.fields.botcheck.checked = true;
    await bot.send();
    assert.equal(bot.requests.length, 0);
});

test('mail app body safely encodes punctuation and line breaks', () => {
    const app = setup(async () => {});
    app.fields.message.value = 'A & B?\nHello';
    app.mail();
    assert.match(app.context.window.location.href, /A%20%26%20B%3F%0AHello/);
    assert.equal(app.requests.length, 0);
});

test('missing or unfinished CAPTCHA blocks network submission', async () => {
    const app = setup(async () => { assert.fail('Must not send without CAPTCHA'); });
    app.fields['h-captcha-response'].value = '';
    await app.send();
    assert.equal(app.requests.length, 0);
    assert.match(app.status.textContent, /security check/);
    delete app.fields['h-captcha-response'];
    await app.send();
    assert.equal(app.requests.length, 0);
});

test('rejected CAPTCHA keeps the text and asks for a new token', async () => {
    const app = setup(async () => ({ ok: false, json: async () => ({ success: false, body: { message: 'Captcha validation failed' } }) }));
    let resets = 0;
    app.context.window.hcaptcha = { reset() { resets++; } };
    await app.send();
    assert.equal(resets, 1);
    assert.equal(app.fields['h-captcha-response'].value, '');
    assert.equal(app.fields.message.value, 'Hello there');
    assert.match(app.status.textContent, /Captcha validation failed/);
    await app.send();
    assert.equal(app.requests.length, 1);
});

test('a CAPTCHA reset error cannot turn an accepted send into a duplicate', async () => {
    const app = setup(async () => ({ ok: true, json: async () => ({ success: true }) }));
    app.context.window.hcaptcha = { reset() { throw Error('Widget unloaded'); } };
    await app.send();
    assert.deepEqual(app.navigations, ['/thank-you/']);
    assert.equal(app.requests.length, 1);
});

test('the existing personal greeting rule opens the special thank-you after acceptance', async () => {
    const app = setup(async () => ({ ok: true, json: async () => ({ success: true }) }));
    // Synthetic address matching the public legacy hash; no real person's address.
    app.fields.email.value = 'S9G0ABQN@example.invalid';
    await app.send();
    assert.deepEqual(app.navigations, ['/special-thank-you/']);
    assert.equal(app.attributes['session:specialAccess'], 'true');
    assert.equal(app.requests.length, 1);
});

test('blocked browser storage falls back to the normal thank-you without another send', async () => {
    const app = setup(async () => ({ ok: true, json: async () => ({ success: true }) }), { blockStorage: true });
    app.fields.email.value = 's9g0abqn@example.invalid';
    await app.send();
    assert.deepEqual(app.navigations, ['/thank-you/']);
    assert.equal(app.requests.length, 1);
});

test('invisible CAPTCHA obtains a token on submit and then sends once', async () => {
    const app = setup(async () => ({ ok: true, json: async () => ({ success: true }) }));
    delete app.fields['h-captcha-response'];
    let checks = 0;
    app.context.window.hcaptcha = { execute: async () => { checks++; return { response: 'new-token' }; } };
    await app.send();
    assert.equal(checks, 1);
    assert.equal(app.requests[0][1].body.get('h-captcha-response'), 'new-token');
    assert.deepEqual(app.navigations, ['/thank-you/']);
});

test('closing an invisible challenge preserves the message without sending', async () => {
    const app = setup(async () => { assert.fail('Should not send'); });
    app.fields['h-captcha-response'].value = '';
    app.context.window.hcaptcha = { execute: async () => { throw Error('challenge-closed'); } };
    await app.send();
    assert.equal(app.requests.length, 0);
    assert.equal(app.submit.disabled, false);
    assert.equal(app.fields.message.value, 'Hello there');
});

test('repeated clicks while a challenge is open do not open more challenges', async () => {
    const app = setup(async () => ({ ok: true, json: async () => ({ success: true }) }));
    app.fields['h-captcha-response'].value = '';
    let resolve;
    let checks = 0;
    app.context.window.hcaptcha = { execute: () => { checks++; return new Promise(r => { resolve = r; }); } };
    const pending = app.send();
    await app.send();
    assert.equal(checks, 1);
    assert.equal(app.requests.length, 0);
    resolve({ response: 'new-token' });
    await pending;
    assert.equal(app.requests.length, 1);
});
