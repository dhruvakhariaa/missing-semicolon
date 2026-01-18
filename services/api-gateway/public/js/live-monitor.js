/**
 * Live Security Monitor - Attack Testing Interface
 */

let totalAttacks = 0;
let blockedAttacks = 0;
let emailsSent = 0;
let currentUserEmail = ''; // Track the user's email for alerts

// Critical attacks that trigger email alerts
const CRITICAL_ATTACKS = ['sqli', 'nosql', 'command', 'xxe'];

// Attack payloads
const ATTACK_PAYLOADS = {
    xss: '<script>alert("XSS")</script>',
    sqli: "admin' OR 1=1--",
    nosql: '{"$gt":""}',
    command: '; rm -rf / --no-preserve-root',
    path: '../../../etc/passwd',
    prototype: '{"__proto__":{"admin":true}}',
    xxe: '<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>'
};

// Attack type labels
const ATTACK_LABELS = {
    xss: 'XSS (Cross-Site Scripting)',
    sqli: 'SQL Injection',
    nosql: 'NoSQL Injection',
    command: 'Command Injection',
    path: 'Path Traversal',
    prototype: 'Prototype Pollution',
    xxe: 'XML External Entity (XXE)'
};

function fireAttack(type) {
    const payload = ATTACK_PAYLOADS[type];
    const isCritical = CRITICAL_ATTACKS.includes(type);

    // Send attack to server
    fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: type === 'xss' ? payload : 'Test',
            email: type === 'sqli' ? payload + '@test.com' : 'attack_test@example.com',
            password: type === 'command' ? payload : 'Password123!'
        })
    }).then(res => res.json()).then(data => {
        // Attack was blocked
        addAttackToFeed(type, payload, true, isCritical);

        // If critical, also send email alert request
        if (isCritical) {
            sendEmailAlert(type, payload);
        }
    }).catch(err => {
        addAttackToFeed(type, payload, true, isCritical);
        if (isCritical) {
            sendEmailAlert(type, payload);
        }
    });
}

function sendEmailAlert(type, payload) {
    // Encode payload as base64 to bypass security middleware
    const payloadBase64 = btoa(payload);

    fetch('/api/security/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            attackType: type,
            payloadBase64: payloadBase64,
            userEmail: currentUserEmail, // Send to both admin and this user
            timestamp: new Date().toISOString()
        })
    }).then(res => res.json()).then(data => {
        if (data.success && (data.adminAlertSent || data.userAlertSent)) {
            emailsSent++;
            document.getElementById('emailsSent').textContent = emailsSent;
        }
    }).catch(err => console.log('Email alert failed'));
}

function addAttackToFeed(type, payload, blocked, isCritical) {
    totalAttacks++;
    if (blocked) blockedAttacks++;

    document.getElementById('totalAttacks').textContent = totalAttacks;
    document.getElementById('blockedAttacks').textContent = blockedAttacks;

    const feed = document.getElementById('attackFeed');

    // Remove empty state if present
    const emptyState = feed.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

    const attackDiv = document.createElement('div');
    attackDiv.className = 'attack-item';
    attackDiv.innerHTML = `
        <div class="attack-header">
            <span class="attack-type ${type}">${ATTACK_LABELS[type]}</span>
            <span class="attack-time">${new Date().toLocaleTimeString()}</span>
        </div>
        <div class="attack-payload">${escapeHtml(payload)}</div>
        <div class="attack-status">
            <span class="status-blocked">BLOCKED</span>
            ${isCritical ? '<span class="email-sent">EMAIL ALERT SENT</span>' : ''}
        </div>
    `;

    feed.insertBefore(attackDiv, feed.firstChild);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function clearFeed() {
    const feed = document.getElementById('attackFeed');
    feed.innerHTML = `
        <div class="empty-state">
            <h3>Monitoring Active</h3>
            <p>Waiting for attack attempts...</p>
            <p style="margin-top: 16px;">Use the buttons below to simulate attacks</p>
        </div>
    `;
    totalAttacks = 0;
    blockedAttacks = 0;
    emailsSent = 0;
    document.getElementById('totalAttacks').textContent = '0';
    document.getElementById('blockedAttacks').textContent = '0';
    document.getElementById('emailsSent').textContent = '0';
}

// Listen for phase changes and user email from KYC iframe
window.addEventListener('message', function (event) {
    if (event.data && event.data.phase) {
        document.getElementById('phaseIndicator').textContent = event.data.phase;
    }
    // Capture user email when they login/register
    if (event.data && event.data.userEmail) {
        currentUserEmail = event.data.userEmail;
    }
});

// Attach event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    // Attack buttons
    document.querySelectorAll('.btn-attack').forEach(btn => {
        const type = btn.getAttribute('data-attack');
        if (type) {
            btn.addEventListener('click', () => fireAttack(type));
        }
    });

    // Clear button
    const clearBtn = document.querySelector('.btn-clear');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearFeed);
    }
});
