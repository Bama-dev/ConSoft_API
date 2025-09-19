import { Schema, model, Types, InferSchemaType } from 'mongoose';

const StockSchema = new Schema(
  {
    material: { type: Types.ObjectId, ref: 'Material', required: true },
    unit: { type: Types.ObjectId, ref: 'Unit', required: true },
    quantity: { type: Schema.Types.Decimal128, required: true },
  },
  { timestamps: true, collection: 'materiales_stock' }
);

StockSchema.index({ material: 1, unit: 1 }, { unique: true });

export type Stock = InferSchemaType<typeof StockSchema> & { _id: Types.ObjectId };

export const StockModel = model<Stock>('Stock', StockSchema);





