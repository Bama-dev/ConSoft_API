import { Schema, model, Types, InferSchemaType } from 'mongoose';

const RoleSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: Boolean, default: true },
    permissions: [{ type: Types.ObjectId, ref: 'Permiso' }],
  },
);

RoleSchema.virtual("usersCount", {
  ref: "users",
  localField: "_id",
  foreignField: "role"
})


export const RoleModel = model('Role', RoleSchema);



