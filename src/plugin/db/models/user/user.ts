import { Schema, model } from 'mongoose';
import { UserSchema } from './interface'


const userSchema = new Schema<UserSchema>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  pass: { type: String, required: true },
});

const UserModel = model<UserSchema>('User', userSchema);

export default UserModel