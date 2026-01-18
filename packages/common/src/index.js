// Middleware
const { authenticate, optionalAuth } = require('./middleware/auth');
const { authorize, checkSectorAccess, systemAdminOnly, govOfficialOnly, ROLE_HIERARCHY } = require('./middleware/rbac');

// Utils
const ServiceRegistry = require('./utils/ServiceRegistry');
const S3Client = require('./utils/S3Client');
const logger = require('./utils/logger');
const errors = require('./utils/errors');

module.exports = {
    // Middleware
    authenticate,
    optionalAuth,
    authorize,
    checkSectorAccess,
    systemAdminOnly,
    govOfficialOnly,
    ROLE_HIERARCHY,

    // Utils
    ServiceRegistry,
    S3Client,
    logger,

    // Errors
    ...errors
};
