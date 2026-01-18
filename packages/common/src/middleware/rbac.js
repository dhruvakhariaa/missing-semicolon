/**
 * RBAC Middleware - 4 Roles: citizen, sector_manager, government_official, system_admin
 */

const ROLE_HIERARCHY = {
    citizen: 1,
    sector_manager: 2,
    government_official: 3,
    system_admin: 0  // Separate track - technical only
};

/**
 * Role-based access control
 */
const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }

        const userLevel = ROLE_HIERARCHY[req.user.role];
        const minRequired = Math.min(...allowedRoles.map(r => ROLE_HIERARCHY[r] || 99));

        // System admin is separate - only allowed if explicitly listed
        if (req.user.role === 'system_admin' && !allowedRoles.includes('system_admin')) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        // Hierarchy check
        if (userLevel >= minRequired) return next();

        res.status(403).json({ success: false, error: 'Access denied' });
    };
};

/**
 * Sector access check - Sector Managers can only access their assigned sector
 */
const checkSectorAccess = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { role, assignedSector } = req.user;
    const requestedSector = req.params.sector || req.body.sector || req.query.sector;

    // Government officials can access all sectors
    if (role === 'government_official') return next();

    // Sector managers can only access their assigned sector
    if (role === 'sector_manager') {
        if (!requestedSector || assignedSector === requestedSector) return next();
        return res.status(403).json({ success: false, error: 'Sector access denied' });
    }

    next();
};

/**
 * System admin only - for technical metrics
 */
const systemAdminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    if (req.user.role !== 'system_admin') {
        return res.status(403).json({ success: false, error: 'System admin access required' });
    }
    next();
};

/**
 * Government official only
 */
const govOfficialOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    if (req.user.role !== 'government_official') {
        return res.status(403).json({ success: false, error: 'Government official access required' });
    }
    next();
};

module.exports = {
    authorize,
    checkSectorAccess,
    systemAdminOnly,
    govOfficialOnly,
    ROLE_HIERARCHY
};
