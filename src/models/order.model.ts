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
        // Identifica si el ítem corresponde a un producto o servicio
        tipo: { type: String, enum: ['producto', 'servicio'], required: true, trim: true },
        // Referencias opcionales según el tipo
        id_producto: { type: Types.ObjectId, ref: 'Producto' },
        id_servicio: { type: Types.ObjectId, ref: 'Servicio' },
        // Datos complementarios
        detalles: { type: String },
        cantidad: { type: Number, default: 1 },
        valor: { type: Number },
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





