"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const user_model_1 = require("../models/user.model");
const bcrypt_1 = require("bcrypt");
const jwt_1 = require("../utils/jwt");
const env_1 = require("../config/env");
const google_auth_library_1 = require("google-auth-library");
const crypto_1 = __importDefault(require("crypto"));
exports.AuthController = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await user_model_1.UserModel.findOne({ email }).populate({
                path: "role",
                populate: {
                    path: "permissions",
                    model: "Permiso"
                }
            });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            const isMatch = await (0, bcrypt_1.compare)(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Incorrect password, please try again' });
            }
            const payload = {
                id: user._id,
                email: user.email,
                role: user.role,
            };
            const token = (0, jwt_1.generateToken)(payload);
            res.cookie('token', token, {
                httpOnly: true,
                secure: env_1.env.nodeEnv === 'production',
                sameSite: env_1.env.nodeEnv === 'production' ? 'none' : 'lax',
                maxAge: 1000 * 60 * 60 * 2,
            });
            res.status(200).json({ message: 'Login successful' });
        }
        catch (err) {
            res.status(500).json({ error: 'Error during login' });
        }
    },
    google: async (req, res) => {
        try {
            const { idToken } = req.body || {};
            if (!idToken)
                return res.status(400).json({ message: 'idToken is required' });
            if (!env_1.env.googleClientId)
                return res.status(500).json({ message: 'Google client not configured' });
            const client = new google_auth_library_1.OAuth2Client(env_1.env.googleClientId);
            const ticket = await client.verifyIdToken({ idToken, audience: env_1.env.googleClientId });
            const payload = ticket.getPayload();
            if (!payload || !payload.email)
                return res.status(400).json({ message: 'Invalid Google token' });
            if (!payload.email_verified)
                return res.status(400).json({ message: 'Email not verified by Google' });
            const email = payload.email.toLowerCase();
            let user = await user_model_1.UserModel.findOne({ email });
            if (!user) {
                const tempPassword = crypto_1.default.randomBytes(16).toString('hex');
                const hashed = await (0, bcrypt_1.hash)(tempPassword, 10);
                const role = env_1.env.defaultUserRoleId; // default role from env
                user = await user_model_1.UserModel.create({
                    name: payload.name || email,
                    email,
                    password: hashed,
                    role,
                });
            }
            const token = (0, jwt_1.generateToken)({ id: user._id, email: user.email });
            res.cookie('token', token, {
                httpOnly: true,
                secure: env_1.env.nodeEnv === 'production',
                sameSite: env_1.env.nodeEnv === 'production' ? 'none' : 'lax',
                maxAge: 1000 * 60 * 60 * 2,
            });
            return res.status(200).json({ message: 'Login successful' });
        }
        catch (err) {
            return res.status(500).json({ error: 'Error during Google login' });
        }
    },
    logout: async (req, res) => {
        try {
            res.clearCookie('token', {
                httpOnly: true,
                secure: env_1.env.nodeEnv === 'production',
                sameSite: 'strict',
            });
            res.json({ message: 'Logout successful' });
        }
        catch (err) {
            res.status(500).json({ error: 'Error during logout' });
        }
    },
    me: (req, res) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        res.status(200).json(req.user);
    },
};
