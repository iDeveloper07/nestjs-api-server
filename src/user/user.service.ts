import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import axios from 'axios';
// import { RabbitMQService } from '.././rabbitmq/rabbitmq.service';
import * as amqp from 'amqplib';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  // async createUser(createUserDto: CreateUserDto): Promise<User> {
  async createUser(name:string, email:string): Promise<User> {
    // async createUser(name:string, email:string): Promise<User> {

    const createUserDto = new CreateUserDto();
    console.log(createUserDto);
    createUserDto.name = name;
    createUserDto.email = email;
    console.log(createUserDto);
    const createdUser = new this.userModel(createUserDto);
    const savedUser = await createdUser.save();

    await this.sendEmail(savedUser.email);
    await this.sendRabbitEvent(savedUser._id);

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

  private async sendRabbitEvent(userId: string): Promise<void> {
    try {
      const connection = await amqp.connect('amqp://localhost');
      const channel = await connection.createChannel();
      const queue = 'hello';

      await channel.assertQueue(queue, { durable: false });
      channel.sendToQueue(queue, Buffer.from(userId));

      console.log(`RabbitMQ event sent for user ${userId}`);

      setTimeout(() => {
        connection.close();
      }, 500);
    } catch (error) {
      console.error(`Error sending RabbitMQ event: ${error.message}`);
      throw error;
    }
  }
  private async sendEmail(email: string): Promise<void> {
    // Implement email sending logic here
    console.log(`Sending email to ${email}`);
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
