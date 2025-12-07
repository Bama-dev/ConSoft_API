import { Schema, model, Types, InferSchemaType } from 'mongoose';

const PermissionSchema = new Schema(
  {
    module: { type: String, required: true, trim: true },
    action: { type: String, trim: true },
  },
);

// Evitar duplicados por módulo/acción
PermissionSchema.index({ module: 1, action: 1 }, { unique: true });

export const PermissionModel = model('Permiso', PermissionSchema);



