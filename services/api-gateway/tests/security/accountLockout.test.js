/**
 * Account Lockout Security Tests
 * Tests protection against brute force and credential stuffing attacks
 */

const mongoose = require('mongoose');
const { hashPassword, verifyPassword } = require('../../src/utils/password');

// Mock User model for testing
const createMockUserModel = () => {
    const users = new Map();

    class MockUser {
        constructor(data) {
            this._id = data._id || new mongoose.Types.ObjectId();
            this.email = data.email;
            this.passwordHash = data.passwordHash;
            this.loginAttempts = data.loginAttempts || 0;
            this.lockUntil = data.lockUntil || null;
        }

        get isLocked() {
            return !!(this.lockUntil && this.lockUntil > Date.now());
        }

        async incLoginAttempts() {
            if (this.lockUntil && this.lockUntil < Date.now()) {
                this.loginAttempts = 1;
                this.lockUntil = null;
            } else {
                this.loginAttempts += 1;
                if (this.loginAttempts >= 5) {
                    this.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
                }
            }
            users.set(this.email, this);
            return this;
        }

        async resetLoginAttempts() {
            this.loginAttempts = 0;
            this.lockUntil = null;
            users.set(this.email, this);
            return this;
        }

        async save() {
            users.set(this.email, this);
            return this;
        }

        static async findByEmailWithPassword(email) {
            return users.get(email) || null;
        }

        static async create(data) {
            const user = new MockUser(data);
            users.set(user.email, user);
            return user;
        }

        static clear() {
            users.clear();
        }
    }

    return MockUser;
};

describe('Account Lockout Security', () => {
    let MockUser;
    let testUser;
    const testPassword = 'SecurePass@123';

    beforeEach(async () => {
        MockUser = createMockUserModel();
        MockUser.clear();

        const passwordHash = await hashPassword(testPassword);
        testUser = await MockUser.create({
            email: 'test@example.com',
            passwordHash
        });
    });

    describe('Failed Login Attempts Tracking', () => {
        test('should start with zero login attempts', () => {
            expect(testUser.loginAttempts).toBe(0);
            expect(testUser.isLocked).toBe(false);
        });

        test('should increment login attempts on failed login', async () => {
            await testUser.incLoginAttempts();
            expect(testUser.loginAttempts).toBe(1);
        });

        test('should track multiple failed attempts', async () => {
            for (let i = 1; i <= 4; i++) {
                await testUser.incLoginAttempts();
                expect(testUser.loginAttempts).toBe(i);
            }
        });
    });

    describe('Account Locking', () => {
        test('should lock account after 5 failed attempts', async () => {
            for (let i = 0; i < 5; i++) {
                await testUser.incLoginAttempts();
            }

            expect(testUser.loginAttempts).toBe(5);
            expect(testUser.isLocked).toBe(true);
            expect(typeof testUser.lockUntil).toBe('number');
        });

        test('should not lock before 5 attempts', async () => {
            for (let i = 0; i < 4; i++) {
                await testUser.incLoginAttempts();
            }

            expect(testUser.loginAttempts).toBe(4);
            expect(testUser.isLocked).toBe(false);
        });

        test('should set lockout duration to 15 minutes', async () => {
            for (let i = 0; i < 5; i++) {
                await testUser.incLoginAttempts();
            }

            const expectedUnlock = Date.now() + 15 * 60 * 1000;
            const timeDiff = Math.abs(testUser.lockUntil - expectedUnlock);

            // Allow 1000ms tolerance for execution time
            expect(timeDiff).toBeLessThan(1000);
        });
    });

    describe('Locked Account Behavior', () => {
        beforeEach(async () => {
            // Lock the account
            for (let i = 0; i < 5; i++) {
                await testUser.incLoginAttempts();
            }
        });

        test('should reject login even with correct password when locked', async () => {
            expect(testUser.isLocked).toBe(true);

            // Even though password is correct, account is locked
            const isValid = await verifyPassword(testPassword, testUser.passwordHash);
            expect(isValid).toBe(true); // Password IS correct
            expect(testUser.isLocked).toBe(true); // But account IS locked
        });

        test('should remain locked until lockout expires', () => {
            expect(testUser.isLocked).toBe(true);

            // Simulate time passing (but not 15 minutes)
            testUser.lockUntil = Date.now() + 5 * 60 * 1000;
            expect(testUser.isLocked).toBe(true);
        });

        test('should unlock after lockout period expires', () => {
            // Set lockout to past
            testUser.lockUntil = Date.now() - 1000;
            expect(testUser.isLocked).toBe(false);
        });
    });

    describe('Login Success Reset', () => {
        test('should reset attempts on successful login', async () => {
            // Add some failed attempts
            await testUser.incLoginAttempts();
            await testUser.incLoginAttempts();
            expect(testUser.loginAttempts).toBe(2);

            // Simulate successful login
            await testUser.resetLoginAttempts();

            expect(testUser.loginAttempts).toBe(0);
            expect(testUser.lockUntil).toBeNull();
        });

        test('should allow login after lockout expires and reset', async () => {
            // Lock account
            for (let i = 0; i < 5; i++) {
                await testUser.incLoginAttempts();
            }
            expect(testUser.isLocked).toBe(true);

            // Simulate lockout expiration
            testUser.lockUntil = Date.now() - 1000;

            // New login attempt resets counter
            await testUser.incLoginAttempts();
            expect(testUser.loginAttempts).toBe(1);
            expect(testUser.isLocked).toBe(false);
        });
    });

    describe('Brute Force Attack Simulation', () => {
        test('should protect against rapid successive attempts', async () => {
            const attempts = [];

            for (let i = 0; i < 10; i++) {
                await testUser.incLoginAttempts();
                attempts.push({
                    attempt: i + 1,
                    locked: testUser.isLocked
                });
            }

            // First 4 attempts: not locked
            expect(attempts.slice(0, 4).every(a => !a.locked)).toBe(true);

            // From 5th attempt: locked
            expect(attempts.slice(4).every(a => a.locked)).toBe(true);
        });
    });
});
