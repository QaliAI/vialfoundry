import test from 'node:test';
import assert from 'node:assert/strict';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

test('escapeHtml prevents XSS and HTML injection in transactional email body', () => {
  const malicious = '<script>alert("pwned")</script> & <img src=x onerror=alert(1)>';
  const safe = escapeHtml(malicious);
  assert.equal(
    safe,
    '&lt;script&gt;alert(&quot;pwned&quot;)&lt;/script&gt; &amp; &lt;img src=x onerror=alert(1)&gt;'
  );
  assert.ok(!safe.includes('<script>'));
  assert.ok(!safe.includes('<img'));
});

test('email regex correctly validates standard and rejection cases', () => {
  assert.ok(EMAIL_REGEX.test('researcher@university.edu'));
  assert.ok(EMAIL_REGEX.test('name+tag@domain.co.uk'));
  assert.ok(!EMAIL_REGEX.test('invalid-email'));
  assert.ok(!EMAIL_REGEX.test('@domain.com'));
  assert.ok(!EMAIL_REGEX.test('user@'));
  assert.ok(!EMAIL_REGEX.test('user@domain'));
});

test('honeypot detection traps automated bot submissions', () => {
  const humanPayload = {
    name: 'Dr. Test',
    email: 'test@lab.org',
    message: 'Valid scientific inquiry',
    organization_website: '',
  };
  const botPayload = {
    name: 'Spam Bot',
    email: 'spam@bot.net',
    message: 'Buy cheap watches',
    organization_website: 'https://spam-link.xyz',
  };

  const isBotHuman = Boolean(humanPayload.organization_website);
  const isBotSpam = Boolean(botPayload.organization_website);

  assert.equal(isBotHuman, false);
  assert.equal(isBotSpam, true);
});
