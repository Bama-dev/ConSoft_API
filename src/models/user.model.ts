import { Schema, model, Types, InferSchemaType } from 'mongoose';
import { IUser } from '../types/interfaces';

const UserSchema = new Schema({
	name: { type: String, required: true, trim: true },
	email: { type: String, required: true, unique: true, lowercase: true, trim: true },
	profile_picture : {type:String},
	password: { type: String, required: true },
	document: { type: String, trim: true },
	address: { type: String, trim: true },
	phone: { type: String, trim: true },
	role: { type: Types.ObjectId, ref: 'Role', required: true },
	status: { type: Boolean, default: true },
	registeredAt: { type: Date, default: () => new Date() },
	favorites: [{ type: Types.ObjectId, ref: 'Product' }],
	
});

export const UserModel = model<IUser>('User', UserSchema);
