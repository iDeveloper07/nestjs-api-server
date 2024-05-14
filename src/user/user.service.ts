import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return await createdUser.save();
  }

  async findUserById(userId: string): Promise<User> {
    return await this.userModel.findById(userId).exec();
  }

//   async deleteUser(userId: string): Promise<User> {
//     return await this.userModel.findByIdAndRemove(userId);
//   }

  // Add more methods as needed
}
