"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function verifyToken(req, res, next) {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ message: 'Acces denied. No token provided' });
        }
        const secret = env_1.env.jwt_secret;
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
}
