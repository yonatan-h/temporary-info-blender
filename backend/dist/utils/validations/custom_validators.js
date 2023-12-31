"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidInputError = exports.checkPasswordStrength = void 0;
// A function to check if a password is strong enough
function checkPasswordStrength(password) {
    const criteria = [
        {
            regex: /[A-Z]/,
            message: 'Password must contain at least one uppercase letter',
        },
        {
            regex: /[a-z]/,
            message: 'Password must contain at least one lowercase letter',
        },
        { regex: /\d/, message: 'Password must contain at least one digit' },
        {
            regex: /[!@#$%^&*]/,
            message: 'Password must contain at least one special character',
        },
    ];
    for (const criterion of criteria) {
        if (!criterion.regex.test(password)) {
            throw new InvalidInputError(criterion.message);
        }
    }
    if (password.length < 8) {
        throw new InvalidInputError('Password must be at least 8 characters long');
    }
}
exports.checkPasswordStrength = checkPasswordStrength;
// Custom error for password not strong enough
class InvalidInputError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PasswordNotStrongEnoughError';
    }
}
exports.InvalidInputError = InvalidInputError;
