import { Schema, model, Types, InferSchemaType } from 'mongoose';

const PermissionSchema = new Schema(
  {
    module: { type: String, required: true, trim: true },
    action: { type: String, trim: true },
  },
  {  collection: 'permisos' }
);

export type Permission = InferSchemaType<typeof PermissionSchema> & { _id: Types.ObjectId };

export const PermissionModel = model<Permission>('Permission', PermissionSchema);



