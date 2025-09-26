"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_model_1 = require("../models/user.model");
const crud_controller_1 = require("./crud.controller");
const bcrypt_1 = require("bcrypt");
const env_1 = require("../config/env");
const base = (0, crud_controller_1.createCrudController)(user_model_1.UserModel);
exports.UserController = {
    ...base,
    list: async (req, res) => {
        try {
            const users = await user_model_1.UserModel.find().select("-password -__v").populate({
                path: "role",
                select: "name description",
            });
            res.status(200).json({ ok: true, users });
        }
        catch (err) {
            res.status(500).json({ error: "Error during fetching users" });
        }
    },
    create: async (req, res) => {
        try {
            const { name, email, password, } = req.body;
            const existing = await user_model_1.UserModel.findOne({ email });
            if (existing) {
                return res
                    .status(400)
                    .json({ message: "This email is already in use" });
            }
            const hashedPass = await (0, bcrypt_1.hash)(password, 10);
            const userData = {
                name,
                email,
                password: hashedPass,
                role: env_1.env.defaultUserRoleId,
            };
            const newUser = await user_model_1.UserModel.create(userData);
            res.json({ message: "User registered successfully" });
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ error: "Error during register" });
        }
    },
    update: async (req, res) => {
        try {
            // Evitar escalada de privilegios: ignorar cambios de "role" por este endpoint
            const { role, ...rest } = req.body ?? {};
            const updated = await user_model_1.UserModel.findByIdAndUpdate(req.params.id, rest, { new: true })
                .select("-password -__v")
                .populate({ path: "role", select: "name description" });
            if (!updated)
                return res.status(404).json({ message: "Not found" });
            return res.json(updated);
        }
        catch (err) {
            return res.status(500).json({ error: "Error updating user" });
        }
    },
};
