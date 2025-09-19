import { Schema, model, Types, InferSchemaType } from 'mongoose';

const PermissionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true, collection: 'permisos' }
);

export type Permission = InferSchemaType<typeof PermissionSchema> & { _id: Types.ObjectId };

export const PermissionModel = model<Permission>('Permission', PermissionSchema);



