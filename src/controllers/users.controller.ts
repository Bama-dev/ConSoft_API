import { Request } from "express";
import { UserModel } from "../models/user.model";
import { createCrudController } from "./crud.controller";
import { Response } from "express";
import { hash } from "bcrypt";

const base = createCrudController(UserModel);

export const UserController = {
  ...base,
  get: async (req: Request, res: Response) => {
    try {
      const user = await UserModel.findById(req.params.id)
        .select("-password -__v")
        .populate({ path: "role", select: "name description" });
      if (!user) return res.status(404).json({ message: "Not found" });
      return res.json(user);
    } catch (err) {
      return res.status(500).json({ error: "Error fetching user" });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const { password, ...rest } = req.body ?? {};
      const updateData: any = { ...rest };
      if (password) {
        updateData.password = await hash(password, 10);
      }

      const updated = await UserModel.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      )
        ?.select("-password -__v")
        .populate({ path: "role", select: "name description" });

      if (!updated) return res.status(404).json({ message: "Not found" });
      return res.json(updated);
    } catch (err) {
      return res.status(500).json({ error: "Error updating user" });
    }
  },
  list: async (req: Request, res: Response) => {
    try {
      const users = await UserModel.find().select("-password -__v").populate({
        path: "role",
        select: "name description",
      });

      res.status(200).json({ ok: true, users });
    } catch (err) {
      res.status(500).json({ error: "Error during fetching users" });
    }
  },
  create: async (req: Request, res: Response) => {
    try {
      const body = req.body || {};
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      const password = typeof body.password === 'string' ? body.password : '';
      const role = body.role ?? "68ccb444b45b03f1a65cbd26";

      if (!name || !email || !password) {
        return res.status(400).json({ message: "name, email and password are required" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "email is invalid" });
      }

      const existing = await UserModel.findOne({ email });

      if (existing) {
        return res
          .status(400)
          .json({ message: "This email is already in use" });
      }

      const hashedPass = await hash(password, 10);

      const userData = {
        name,
        email,
        password: hashedPass,
        role,
      };

      const newUser = await UserModel.create(userData);

      res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Error during register" });
    }
  },
};
