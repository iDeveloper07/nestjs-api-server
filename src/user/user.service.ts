import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import axios from 'axios';
// import { RabbitMQService } from '.././rabbitmq/rabbitmq.service';
import * as amqp from 'amqplib';
import * as fs from 'fs-extra';


@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {

    if(createUserDto.avatar) {

      const image = await axios.get(createUserDto.avatar, { responseType: 'arraybuffer' });
      const imageData = Buffer.from(image.data, 'binary');

      createUserDto.avatar = imageData.toString('base64');

      const filePath = `./avatars/${createUserDto.id}.png`;

      await fs.ensureDir('./avatars');
      await fs.writeFile(filePath, imageData);
    }

    const createdUser = new this.userModel(createUserDto);
    const savedUser = await createdUser.save();

    return savedUser;
  }

  async findUserById(userId: string): Promise<User> {
    const response = await axios.get(`https://reqres.in/api/users/${userId}`);
    return response.data;
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
    const userData = await this.userModel.findOne({ id : userId}).exec();
    return userData.avatar;
  }

//   async deleteUser(userId: string): Promise<User> {
//     return await this.userModel.findByIdAndRemove(userId);
//   }

  // Add more methods as needed
}
