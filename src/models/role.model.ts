import { Schema, model, Types, InferSchemaType } from 'mongoose';

const RoleSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    active: { type: Boolean, default: true },
    permissions: [{ type: Types.ObjectId, ref: 'Permission' }],
  },
);


export const RoleModel = model('Role', RoleSchema);



