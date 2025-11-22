import { Request } from "express";
import { UserModel } from "../models/user.model";
import { createCrudController } from "./crud.controller";
import { Response } from "express";
import { hash } from "bcrypt";
import { env } from "../config/env";
import { RoleModel } from "../models/role.model";

const base = createCrudController(UserModel);

export const UserController = {
  ...base,
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
      const {
        name,
        email,
        password,
      } = req.body;

      const existing = await UserModel.findOne({ email });

      if (existing) {
        return res
          .status(400)
          .json({ message: "This email is already in use" });
      }

      const hashedPass = await hash(password, 10);

      // Resolver rol por defecto de forma segura:
      // 1) Usar env.defaultUserRoleId si existe
      // 2) Si no, buscar por nombre ('Usuario' o 'Cliente')
      // 3) Si no se encuentra, retornar error controlado
      let roleId: string | undefined = env.defaultUserRoleId;
      if (!roleId) {
        let fallbackRole = await RoleModel.findOne({ name: { $in: ['Usuario', 'Cliente'] } }).select('_id');
        if (!fallbackRole) {
          await RoleModel.create({ name: 'Usuario', description: 'Usuario estándar' });
          fallbackRole = await RoleModel.findOne({ name: 'Usuario' }).select('_id');
        }
        roleId = String((fallbackRole as any)._id);
      }
      const roleIdResolved: string = roleId;

      const userData = {
        name,
        email,
        password: hashedPass,
        role: roleIdResolved,
      };

      const newUser = await UserModel.create(userData);

      res.json({ message: "User registered successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Error during register" });
    }
  },
  update: async (req: Request, res: Response) => {
    try {
      // Evitar escalada de privilegios: ignorar cambios de "role" por este endpoint
      const { role, ...rest } = req.body ?? {};
      const updated = await UserModel.findByIdAndUpdate(req.params.id, rest, { new: true })
        .select("-password -__v")
        .populate({ path: "role", select: "name description" });
      if (!updated) return res.status(404).json({ message: "Not found" });
      return res.json(updated);
    } catch (err) {
      return res.status(500).json({ error: "Error updating user" });
    }
  },
};
