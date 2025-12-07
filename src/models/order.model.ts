import { Schema, model, Types, InferSchemaType } from 'mongoose';

const PaymentSchema = new Schema(
  {
    amount: { type: Number, required: true },
    paidAt: { type: Date, required: true },
    method: { type: String, required: true, trim: true },
    status: { type: String, required: true, trim: true },
  },
);

const AttachmentSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    uploadedBy: { type: Types.ObjectId, ref: 'User', required: true },
    uploadedAt: { type: Date, default: () => new Date() },
  },
  { _id: false }
);



const OrderSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User', required: true },
    status: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    startedAt: { type: Date },
    deliveredAt: { type: Date },
    items: [
  {
    id_servicio: { type: Types.ObjectId, ref: 'Servicio' },
    detalles: { type: String },
    valor: { type: Number }
  }
],
    payments: { type: [PaymentSchema], default: [] },
    attachments: { type: [AttachmentSchema], default: [] },
  },
);

// Índices para reportes y listados
OrderSchema.index({ user: 1, status: 1, startedAt: -1 });
OrderSchema.index({ status: 1, startedAt: -1 });

export const OrderModel = model('Pedido', OrderSchema);





