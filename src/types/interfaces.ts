import { Document, Types } from 'mongoose';

export interface IUser extends Document {
	_id: Types.ObjectId;
	name: string;
	email: string;
	password: string;
	document?: string;
	address?: string;
	phone?: string;
	role: Types.ObjectId;
	active: boolean;
	registeredAt: Date;
	favorites: Types.ObjectId[];
}
