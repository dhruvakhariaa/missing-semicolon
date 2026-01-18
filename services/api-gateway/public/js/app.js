/**
 * Security Dashboard - Main Application JavaScript
 * Handles navigation, authentication, attacks, and stats display
 * 
 * This file MUST be loaded after attacks.js
 */

// ============================================
// GLOBAL STATE
// ============================================
window.securityStats = { passed: 0, failed: 0, blocked: 0 };
window.currentToken = null;

// ============================================
// INITIALIZATION - Runs when DOM is ready
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('🛡️ Security Dashboard initialized');

    initNavigation();
    initAuthTabs();
    initLoginForm();
    initSignupForm();
    initActionButtons();
    initAttackButtons();
    populateMatrix();

    logToConsole('Security Dashboard ready - Click "Run Full Scan" to test all security features', 'info');
});

// ============================================
// NAVIGATION - Sidebar menu clicks
// ============================================
function initNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');

    navBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const target = this.dataset.tab;

            // Update active button
            navBtns.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');

            // Update active view
            views.forEach(function (v) { v.classList.remove('active'); });
            const targetView = document.getElementById(target + '-view');
            if (targetView) {
                targetView.classList.add('active');
            }
        });
    });
}

// ============================================
// AUTH TAB SWITCHING - Login/Signup tabs
// ============================================
function initAuthTabs() {
    const loginTabBtn = document.getElementById('login-tab-btn');
    const signupTabBtn = document.getElementById('signup-tab-btn');
    const loginFormContainer = document.getElementById('login-form-container');
    const signupFormContainer = document.getElementById('signup-form-container');

    if (loginTabBtn && signupTabBtn) {
        loginTabBtn.addEventListener('click', function () {
            loginTabBtn.classList.add('active');
            signupTabBtn.classList.remove('active');
            loginFormContainer.classList.add('active');
            signupFormContainer.classList.remove('active');
        });

        signupTabBtn.addEventListener('click', function () {
            signupTabBtn.classList.add('active');
            loginTabBtn.classList.remove('active');
            signupFormContainer.classList.add('active');
            loginFormContainer.classList.remove('active');
        });
    }
}

// ============================================
// LOGIN FORM HANDLER
// ============================================
function initLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        logToConsole('🔐 Attempting login for ' + email + '...', 'info');

        fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        })
            .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
            .then(function (result) {
                if (result.ok) {
                    window.currentToken = result.data.accessToken;
                    localStorage.setItem('accessToken', result.data.accessToken);
                    localStorage.setItem('refreshToken', result.data.refreshToken);
                    showMessage('✅ Login successful! Token stored.', 'success');
                    logToConsole('✅ Login successful - JWT tokens stored in localStorage', 'pass');
                } else {
                    const msg = result.data.error && result.data.error.message ? result.data.error.message : (result.data.message || 'Login failed');
                    showMessage(msg, 'error');
                    logToConsole('❌ Login failed: ' + msg, 'fail');
                }
            })
            .catch(function (error) {
                showMessage('Network error', 'error');
                logToConsole('❌ Network error: ' + error.message, 'fail');
            });
    });
}

// ============================================
// SIGNUP FORM HANDLER
// ============================================
function initSignupForm() {
    const form = document.getElementById('signup-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        if (!name || !email || !password) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        logToConsole('📝 Creating account for ' + email + '...', 'info');
        logToConsole('📦 Data will be stored in MongoDB', 'info');

        fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, email: email, password: password })
        })
            .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, status: res.status, data: data }; }); })
            .then(function (result) {
                if (result.ok) {
                    var userId = result.data.user && result.data.user.id ? result.data.user.id : 'N/A';
                    showMessage('✅ Account created! Check MongoDB for the new user. You can now login.', 'success');
                    logToConsole('✅ User registered successfully: ' + email, 'pass');
                    logToConsole('📦 User ID: ' + userId + ' saved to MongoDB', 'info');

                    // Switch to login tab after success
                    setTimeout(function () {
                        var loginBtn = document.getElementById('login-tab-btn');
                        if (loginBtn) loginBtn.click();
                    }, 2000);
                } else {
                    var msg = result.data.error && result.data.error.message ? result.data.error.message : (result.data.message || 'Registration failed');
                    showMessage(msg, 'error');
                    logToConsole('❌ Registration failed: ' + msg, 'fail');
                }
            })
            .catch(function (error) {
                showMessage('Network error', 'error');
                logToConsole('❌ Network error: ' + error.message, 'fail');
            });
    });
}

// ============================================
// ACTION BUTTONS (Run Full Scan, Clear Logs)
// ============================================
function initActionButtons() {
    var runBtn = document.getElementById('run-all-tests');
    var clearBtn = document.getElementById('clear-results');

    if (runBtn) {
        runBtn.addEventListener('click', runFullScan);
    }
    if (clearBtn) {
        clearBtn.addEventListener('click', clearLogs);
    }
}

function runFullScan() {
    var btn = document.getElementById('run-all-tests');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Scanning...';
    }

    logToConsole('🚀 Starting Full Security Scan...', 'info');
    logToConsole('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');

    // Reset stats
    window.securityStats = { passed: 0, failed: 0, blocked: 0 };
    updateStatsDisplay();
    resetMatrix();

    var attacks = [
        'xss_script', 'xss_event', 'sql_injection', 'nosql_injection',
        'cmd_injection', 'weak_password', 'common_password', 'breached_password',
        'brute_force', 'token_tamper', 'token_none', 'token_expired',
        'rate_limit', 'csrf', 'hsts', 'csp_policies', 'account_lockout',
        'idor', 'mass_assignment', 'large_payload', 'privilege_escalation'
    ];

    // Run attacks sequentially
    var index = 0;
    function runNext() {
        if (index >= attacks.length) {
            // Scan complete
            logToConsole('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
            logToConsole('✅ Full scan complete!', 'pass');
            var total = window.securityStats.passed + window.securityStats.failed;
            var score = total === 0 ? 0 : Math.round((window.securityStats.passed / total) * 100);
            logToConsole('📊 Summary: ' + window.securityStats.passed + ' passed, ' + window.securityStats.failed + ' failed, ' + window.securityStats.blocked + ' attacks blocked', 'info');
            logToConsole('🔒 Security Score: ' + score + '%', 'info');

            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Run Full Scan';
            }
            return;
        }

        runAttack(attacks[index]).then(function () {
            index++;
            setTimeout(runNext, 200);
        });
    }

    runNext();
}

function clearLogs() {
    var logsDiv = document.getElementById('test-logs');
    if (logsDiv) {
        logsDiv.innerHTML = '';
    }
    window.securityStats = { passed: 0, failed: 0, blocked: 0 };
    updateStatsDisplay();
    resetMatrix();
    logToConsole('Logs cleared', 'info');
}

// ============================================
// ATTACK BUTTONS - Individual attack clicks
// ============================================
function initAttackButtons() {
    var buttons = document.querySelectorAll('.attack-btn');
    buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var attackType = this.dataset.attack;
            if (!attackType) return;

            this.classList.add('running');
            var self = this;
            runAttack(attackType).then(function () {
                self.classList.remove('running');
            });
        });
    });
}

function runAttack(type) {
    logToConsole('🎯 Launching ' + type + ' attack...', 'info');

    return executeAttack(type).then(function (result) {
        if (result.blocked) {
            window.securityStats.passed++;
            window.securityStats.blocked++;
            logToConsole('✅ BLOCKED: ' + type + ' - ' + result.message, 'pass');
        } else {
            window.securityStats.failed++;
            logToConsole('❌ NOT BLOCKED: ' + type + ' - ' + result.message, 'fail');
        }

        updateStatsDisplay();
        updateMatrix(type, result.blocked);
    }).catch(function (error) {
        logToConsole('⚠️ Error during ' + type + ': ' + error.message, 'warn');
    });
}

// ============================================
// UI HELPERS
// ============================================
function showMessage(msg, type) {
    var box = document.getElementById('auth-message');
    if (box) {
        box.textContent = msg;
        box.className = 'message-box ' + type;
        box.style.display = 'block';
        setTimeout(function () { box.style.display = 'none'; }, 5000);
    }
}

function logToConsole(msg, type) {
    var consoleDiv = document.getElementById('test-logs');
    if (!consoleDiv) return;

    var entry = document.createElement('div');
    entry.className = 'log-entry ' + (type || 'info');
    var time = new Date().toLocaleTimeString();
    entry.innerHTML = '<span class="log-time">[' + time + ']</span> ' + msg;
    consoleDiv.appendChild(entry);
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

function updateStatsDisplay() {
    var passedEl = document.getElementById('stats-passed');
    var failedEl = document.getElementById('stats-failed');
    var blockedEl = document.getElementById('stats-blocked');
    var scoreEl = document.getElementById('stats-score');

    if (passedEl) passedEl.textContent = window.securityStats.passed;
    if (failedEl) failedEl.textContent = window.securityStats.failed;
    if (blockedEl) blockedEl.textContent = window.securityStats.blocked;

    var total = window.securityStats.passed + window.securityStats.failed;
    var score = total === 0 ? 0 : Math.round((window.securityStats.passed / total) * 100);
    if (scoreEl) scoreEl.textContent = score + '%';
}

function populateMatrix() {
    var matrix = document.getElementById('protection-matrix');
    if (!matrix) return;

    var protections = [
        { id: 'xss', name: 'XSS Protection' },
        { id: 'sql', name: 'SQL Injection' },
        { id: 'nosql', name: 'NoSQL Injection' },
        { id: 'rate', name: 'Rate Limiting' },
        { id: 'brute', name: 'Brute Force' },
        { id: 'lockout', name: 'Account Lockout' },
        { id: 'cookies', name: 'Secure Cookies' },
        { id: 'hsts', name: 'HSTS' },
        { id: 'csp', name: 'CSP Policies' },
        { id: 'token', name: 'Token Security' },
        { id: 'input', name: 'Input Validation' },
        { id: 'password', name: 'Password Weakness' }
    ];

    var html = '';
    for (var i = 0; i < protections.length; i++) {
        var p = protections[i];
        html += '<div class="matrix-item" id="matrix-' + p.id + '">' +
            '<span>' + p.name + '</span>' +
            '<span class="matrix-status">⏳</span>' +
            '</div>';
    }
    matrix.innerHTML = html;
}

function resetMatrix() {
    var items = document.querySelectorAll('.matrix-item');
    items.forEach(function (item) {
        item.classList.remove('pass', 'fail');
        var status = item.querySelector('.matrix-status');
        if (status) status.textContent = '⏳';
    });
}

function updateMatrix(attackType, blocked) {
    var mapping = {
        'xss_script': 'xss', 'xss_event': 'xss',
        'sql_injection': 'sql', 'nosql_injection': 'nosql',
        'cmd_injection': 'input', 'brute_force': 'brute',
        'weak_password': 'password', 'common_password': 'password',
        'breached_password': 'password', 'rate_limit': 'rate',
        'token_tamper': 'token', 'token_none': 'token',
        'token_expired': 'token', 'csrf': 'cookies',
        'hsts': 'hsts', 'csp_policies': 'csp',
        'account_lockout': 'lockout', 'idor': 'token',
        'mass_assignment': 'input', 'large_payload': 'input',
        'privilege_escalation': 'brute'
    };

    var matrixId = mapping[attackType];
    if (!matrixId) return;

    var item = document.getElementById('matrix-' + matrixId);
    if (item) {
        var status = item.querySelector('.matrix-status');
        if (blocked) {
            item.classList.remove('fail');
            item.classList.add('pass');
            if (status) status.textContent = '✅';
        } else {
            item.classList.remove('pass');
            item.classList.add('fail');
            if (status) status.textContent = '❌';
        }
    }
}

// Make functions globally available
window.runAttack = runAttack;
window.runFullScan = runFullScan;
window.clearLogs = clearLogs;
window.showMessage = showMessage;
window.logToConsole = logToConsole;
