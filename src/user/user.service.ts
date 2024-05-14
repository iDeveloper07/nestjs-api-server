import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import axios from 'axios';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {

    console.log("----create------");

    const createdUser = new this.userModel(createUserDto);
    const savedUser = await createdUser.save();

    console.log('Sending email to', savedUser.email);
    console.log('Sending rabbit event for user', savedUser._id);

    return savedUser;
  }

  async findUserById(userId: string): Promise<User> {
    // const user = await this.userModel.findById(userId).exec();
    // console.log("----findUserById------");
    // console.log(user);
    const response = await axios.get(`https://reqres.in/api/users/${userId}`);
    console.log("---response--");
    console.log(response);
    console.log(response.data);
    return response.data;

    // return user;
  }

  async getAvatar(userId: string): Promise<string> {
    // const user = await this.userModel.findById(userId).exec();
    // console.log("----findUserById------");
    // console.log(user);
    const response = await axios.get(`https://reqres.in/api/users/${userId}`);
    console.log("---response--avatar");
    console.log(response);
    console.log(response.data.data.avatar);
    // return response.data.data.avatar;
    
    const image = await axios.get(response.data.data.avatar, { responseType: 'arraybuffer' });
    const imageData = Buffer.from(image.data, 'binary');

    console.log("---image data----");
    console.log(imageData);
    console.log(imageData.toString('base64'));
    return imageData.toString('base64');

    // return user;
  }

//   async deleteUser(userId: string): Promise<User> {
//     return await this.userModel.findByIdAndRemove(userId);
//   }

  // Add more methods as needed
}
