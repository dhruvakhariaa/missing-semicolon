class ApplicationError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

class NotFoundError extends ApplicationError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

class UnauthorizedError extends ApplicationError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}

class ForbiddenError extends ApplicationError {
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}

class ValidationError extends ApplicationError {
    constructor(message = 'Validation failed', errors = []) {
        super(message, 400);
        this.errors = errors;
    }
}

class ConflictError extends ApplicationError {
    constructor(message = 'Resource already exists') {
        super(message, 409);
    }
}

module.exports = {
    ApplicationError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    ValidationError,
    ConflictError
};
