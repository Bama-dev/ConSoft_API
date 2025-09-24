import { Schema, model, Types, InferSchemaType } from 'mongoose';

const PermissionSchema = new Schema(
  {
    module: { type: String, required: true, trim: true },
    action: { type: String, trim: true },
  },
);


export const PermissionModel = model('Permiso', PermissionSchema);



