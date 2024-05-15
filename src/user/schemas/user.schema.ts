import { Schema, Document } from 'mongoose';

export interface User extends Document {
  readonly name: string;
  readonly email: string;
  readonly avatar?: string;
}

export const UserSchema = new Schema({
  name: String,
  email: String,
  avatar: String
});
