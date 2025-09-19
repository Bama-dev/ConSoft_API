import { Schema, model, Types, InferSchemaType } from 'mongoose';

const UnitSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true, collection: 'unidades_medida' }
);

export type Unit = InferSchemaType<typeof UnitSchema> & { _id: Types.ObjectId };

export const UnitModel = model<Unit>('Unit', UnitSchema);





