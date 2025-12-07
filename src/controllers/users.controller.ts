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

      // Password complexity: require at least one uppercase, one number, and one special character
      const hasUppercase = typeof password === 'string' && /[A-Z]/.test(password);
      const hasNumber = typeof password === 'string' && /\d/.test(password);
      const hasSpecial = typeof password === 'string' && /[^A-Za-z0-9]/.test(password);
      if (!password || !hasUppercase || !hasNumber || !hasSpecial) {
        return res.status(400).json({
          message: "Password must include at least one uppercase letter, one number, and one special character",
        });
      }

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
      const userId = req.params.id;
      const { password, role, email, ...rest } = req.body ?? {};

      // Este endpoint NO permite cambiar la contraseña
      if (password != null) {
        return res.status(400).json({ message: "Password cannot be changed via this endpoint" });
      }

      // Validar unicidad de email si se actualiza
      if (email != null) {
        const existing = await UserModel.findOne({ email, _id: { $ne: userId } }).select("_id");
        if (existing) {
          return res.status(400).json({ message: "This email is already in use" });
        }
      }

      // Construir objeto de actualización permitido
      const updateDoc: any = { ...rest };
      if (email != null) updateDoc.email = email;

      // Permitir cambio de rol (admin ya está controlado por permisos en la ruta)
      if (role != null) {
        const roleExists = await RoleModel.findById(role).select("_id");
        if (!roleExists) {
          return res.status(400).json({ message: "Invalid role id" });
        }
        updateDoc.role = role;
      }

      const updated = await UserModel.findByIdAndUpdate(userId, updateDoc, { new: true })
        .select("-password -__v")
        .populate({ path: "role", select: "name description" });
      if (!updated) return res.status(404).json({ message: "Not found" });
      return res.json(updated);
    } catch (err) {
      return res.status(500).json({ error: "Error updating user" });
    }
  },
};
