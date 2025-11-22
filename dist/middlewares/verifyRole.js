"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRole = void 0;
const verifyRole = (module, action) => {
    return (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            const role = user.role;
            if (!role || !role.permissions) {
                return res.status(403).json({ message: 'User has no assigned permissions' });
            }
            const hasPermission = role.permissions.some((perm) => {
                // Soporte para dos formatos:
                // 1) { module, action }
                // 2) { name: 'module.action' }
                if (perm && typeof perm.module === 'string' && typeof perm.action === 'string') {
                    return perm.module === module && perm.action === action;
                }
                const name = perm?.name;
                if (typeof name === 'string' && name.includes('.')) {
                    const [mod, act] = name.split('.');
                    return mod === module && act === action;
                }
                return false;
            });
            if (!hasPermission) {
                return res
                    .status(403)
                    .json({ message: 'You do not have permission to perform this action' });
            }
            next();
        }
        catch (error) {
            console.error('verifyRole error: ', error);
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
    };
};
exports.verifyRole = verifyRole;
