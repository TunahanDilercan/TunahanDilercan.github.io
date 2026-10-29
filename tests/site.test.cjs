const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const main = fs.readFileSync(path.join(root, 'js/main.js'), 'utf8');

function loadMain(href, target) {
    let click;
    const trigger = { getAttribute: () => href, addEventListener: (event, handler) => { click = handler; } };
    const document = {
        documentElement: { className: 'no-js' },
        querySelector: () => null,
        querySelectorAll: selector => selector === '.smoothscroll' ? [trigger] : [],
        getElementById: id => id === 'about' ? target : null,
        addEventListener() {}
    };
    vm.runInNewContext(main, { document, window: { addEventListener() {} }, setTimeout() {} });
    return click;
}

test('shared JS initializes on legal pages without optional plugin bundles', () => {
    assert.doesNotThrow(() => loadMain('/#about'));
});

for (const href of ['/#about', '#', null]) {
    test('smooth scrolling preserves native navigation for ' + href, () => {
        const click = loadMain(href);
        assert.doesNotThrow(() => click({ preventDefault() { assert.fail('Should navigate normally'); } }));
    });
}

test('same-page smooth scrolling still works', () => {
    let scrolled = false;
    let prevented = false;
    const click = loadMain('#about', { scrollIntoView() { scrolled = true; } });
    click({ preventDefault() { prevented = true; } });
    assert.equal(scrolled, true);
    assert.equal(prevented, true);
});

const htmlFiles = fs.readdirSync(root, { recursive: true }).filter(file =>
    file.endsWith('.html') && !file.startsWith('.git' + path.sep));

test('every local HTML asset and page link exists', () => {
    const missing = [];
    for (const file of htmlFiles) {
        const html = fs.readFileSync(path.join(root, file), 'utf8');
        for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
            const value = match[1].split(/[?#]/)[0];
            if (!value || /^(?:[a-z]+:|\/\/)/i.test(value)) continue;
            const resolved = value.startsWith('/') ? path.join(root, value) : path.resolve(root, path.dirname(file), value);
            if (!fs.existsSync(resolved)) missing.push(file + ': ' + value);
        }
    }
    assert.deepEqual(missing, []);
});

test('all inline scripts compile and structured data is valid JSON', () => {
    for (const file of htmlFiles) {
        const html = fs.readFileSync(path.join(root, file), 'utf8');
        for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
            if (match[1].includes('application/ld+json')) JSON.parse(match[2]);
            else new vm.Script(match[2], { filename: file });
        }
    }
});

test('CSS background assets exist', () => {
    const missing = [];
    for (const file of ['css/styles.css', 'css/vendor.css', 'css/security.css']) {
        const css = fs.readFileSync(path.join(root, file), 'utf8');
        for (const match of css.matchAll(/url\(\s*["']?([^\)"']+)/g)) {
            const value = match[1].trim();
            if (/^(?:[a-z]+:|\/\/|#)/i.test(value)) continue;
            const resolved = value.startsWith('/') ? path.join(root, value) : path.resolve(root, path.dirname(file), value);
            if (!fs.existsSync(resolved)) missing.push(file + ': ' + value);
        }
    }
    assert.deepEqual(missing, []);
});

test('404 assets use root paths when served at a missing nested URL', () => {
    const html = fs.readFileSync(path.join(root, '404.html'), 'utf8');
    assert.doesNotMatch(html, /(?:src|href)=["'](?:js|css|images)\//);
});

test('sitemap excludes decorative success and error pages', () => {
    const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
    assert.doesNotMatch(sitemap, /thank-you|404\.html/);
    assert.ok(fs.statSync(path.join(root, 'resume-guide/index.html')).size > 0);
});

test('contact form uses Web3Forms with a configured public ID and CAPTCHA policy', () => {
    const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    assert.match(html, /action="https:\/\/api\.web3forms\.com\/submit"/);
    assert.match(html, /name="access_key" value="[0-9a-f-]{36}"/);
    assert.match(html, /name="botcheck"/);
    assert.match(html, /class="h-captcha"/);
    assert.match(html, /src="https:\/\/js\.hcaptcha\.com\/1\/api\.js/);
    assert.match(html, /frame-src https:\/\/hcaptcha\.com https:\/\/\*\.hcaptcha\.com/);
    assert.doesNotMatch(html, /formsubmit\.co|_captcha|_honey|_replyto/);
});

for (const page of ['special-thank-you', 'special-thank-you-new']) {
    const html = fs.readFileSync(path.join(root, page, 'index.html'), 'utf8');
    const guard = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
        .find(match => match[1].includes("sessionStorage.getItem('specialAccess')"))[1];
    test(page + ' opens with the greeting session and consumes it', () => {
        let removed = false;
        const location = { href: '/' + page + '/' };
        vm.runInNewContext(guard, { window: { location }, sessionStorage: {
            getItem: () => 'true', removeItem: key => { assert.equal(key, 'specialAccess'); removed = true; }
        } });
        assert.equal(location.href, '/' + page + '/');
        assert.equal(removed, true);
    });
    test(page + ' redirects direct visits without a greeting session', () => {
        const location = { href: '/' + page + '/' };
        vm.runInNewContext(guard, { window: { location }, sessionStorage: { getItem: () => null } });
        assert.equal(location.href, '/');
    });
}

test('the normal thank-you returns home after its ten-second countdown', () => {
    const html = fs.readFileSync(path.join(root, 'thank-you/index.html'), 'utf8');
    const code = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
        .find(match => match[1].includes('let seconds = 10'))[1];
    const location = { href: '/thank-you/' };
    const countdown = { textContent: '10' };
    let tick;
    vm.runInNewContext(code, {
        window: { location },
        document: { getElementById: () => countdown, addEventListener() {} },
        setInterval: callback => { tick = callback; return 1; }, clearInterval() {}
    });
    for (let i = 0; i < 9; i++) tick();
    assert.equal(location.href, '/thank-you/');
    tick();
    assert.equal(location.href, '/');
});
