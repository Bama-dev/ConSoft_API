import { Schema, model, Types, InferSchemaType } from 'mongoose';

const PaymentSchema = new Schema(
  {
    amount: { type: Number, required: true },
    paidAt: { type: Date, required: true },
    method: { type: String, required: true, trim: true },
    status: { type: String, required: true, trim: true },
  },
  { _id: false }
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
    type: { type: String, required: true, trim: true },
    status: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    startedAt: { type: Date },
    deliveredAt: { type: Date },
    items: [
  {
    id_servicio: { type: Types.ObjectId, ref: 'Service' },
    detalles: { type: String },
    valor: { type: Number }
  }
]
    payments: { type: [PaymentSchema], default: [] },
    attachments: { type: [AttachmentSchema], default: [] },
  },
  { collection: 'pedidos' }
);



export const OrderModel = model('Order', OrderSchema);





