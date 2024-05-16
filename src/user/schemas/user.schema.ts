import { Schema, Document } from 'mongoose';

export interface User extends Document {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly avatar?: string;
}

export const UserSchema = new Schema({
  id: String,
  name: String,
  email: String,
  avatar: String
});
