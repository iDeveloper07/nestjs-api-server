import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import axios from 'axios';
import * as amqp from 'amqplib';
import * as fs from 'fs-extra';
import * as nodemailer from 'nodemailer';


@Injectable()
export class UserService {

  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async createUser(createUserDto: CreateUserDto): Promise<CreateUserDto> {

    if(createUserDto.avatar) {

      const image     = await axios.get(createUserDto.avatar, { responseType: 'arraybuffer' });
      const imageData = Buffer.from(image.data, 'binary');

      createUserDto.avatar = imageData.toString('base64');

      const filePath = `./avatars/${createUserDto.id}.png`;

      await fs.ensureDir('./avatars');
      await fs.writeFile(filePath, imageData);
    }

    const createdUser = new this.userModel(createUserDto);
    const savedUser   = await createdUser.save();

    await this.sendEmail(savedUser.email);
    await this.sendRabbitEvent(savedUser.id);

    return savedUser;
  }

  async findUserById(userId: string): Promise<CreateUserDto> {
    const response = await axios.get(`https://reqres.in/api/users/${userId}`);
    return response.data;
  }

  async getAvatar(userId: string): Promise<string> {
    const userData = await this.userModel.findOne({ id : userId}).exec();
    return userData.avatar;
  }

  async deleteAvatar(userId: string): Promise<any> {

    const filePath = `./avatars/${userId}.png`; // Adjust this path as per your file storage location

    try {
      await fs.unlink(filePath);
    } catch (error) {
      throw new Error(`Error deleting file: ${error.message}`);
    }

    return await this.userModel.findOneAndUpdate(
      { id: userId },
      { $unset: { avatar: 1 } }
    ).exec();

  }

  async sendRabbitEvent(userId: string): Promise<void> {
    try {
      const connection  = await amqp.connect('amqp://localhost');
      const channel     = await connection.createChannel();
      const queue       = 'hello';

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
  async sendEmail(email: string): Promise<void> {

    console.log("---mail sent to : "+email);
    return;

    const to = email;
    const subject = "Dummy subject";
    const text = "Dummy text";

    const transporter = nodemailer.createTransport({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'your_email@example.com',
        pass: 'your_password',
      },
    });

    const mailOptions = {
      from: 'your_email@example.com',
      to,
      subject,
      text,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Sending email to ${email}`);
    } catch (error) {
      throw new Error(`Error sending email: ${error.message}`);
    }
  }

}
