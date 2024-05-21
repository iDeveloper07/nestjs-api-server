import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import axios from 'axios';
import * as fs from 'fs-extra';
import { CreateUserDto } from './dto/create-user.dto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { HttpService } from '@nestjs/axios';

jest.mock('axios');
jest.mock('fs-extra');

const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('@golevelup/nestjs-rabbitmq', () => ({
  AmqpConnection: jest.fn().mockImplementation(() => ({
    publish: jest.fn(),
  })),
}));

describe('UserService', () => {
  let service: UserService;
  let userModel: Model<User>;
  let amqpConnection: AmqpConnection;
  let httpService : HttpService; 

  beforeEach(async () => {

    const userModelMock = {
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken('User'),
          useValue: {
            new: jest.fn().mockReturnValue({
              save: jest.fn(),
            }),
            constructor: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: AmqpConnection,
          useValue: {
            publish: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get<Model<User>>(getModelToken('User'));
    amqpConnection = module.get<AmqpConnection>(AmqpConnection);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(amqpConnection).toBeDefined();
  });

  // describe('createUser', () => {
  //   it('should create a user, send an email, and publish an event', async () => {
  //     const createUserDto: CreateUserDto = {
  //       id     : '1',
  //       name   : 'John Doe',
  //       email  : 'john.doe@example.com',
  //       avatar : 'https://reqres.in/img/faces/1-image.jpg'
  //     };

  //     const createdUser = {
  //       ...createUserDto,
  //       _id: 'someUserId',
  //       id: '1',
  //       avatar: 'https://reqres.in/img/faces/1-image.jpg',
  //     };

  //     // Mock instance save method
  //     const userInstance = {
  //       ...createdUser,
  //       save: jest.fn().mockResolvedValue(createdUser),
  //     };

  //     // Mock the user model to return the user instance
  //     // (userModel as any).create(userInstance);

  //     jest.spyOn(axios, 'get').mockResolvedValue({ data: 'fakeImageData' });

  //     console.log = jest.fn();

  //     const userModel = jest.fn(); 
  //     const saveSpy = jest.spyOn(userModel.prototype, 'save').mockResolvedValue(createdUser);

  //     const result = await service.createUser(createUserDto);

  //     // Assertions
  //     expect(result).toEqual(createdUser);
  //     expect(userInstance.save).toHaveBeenCalled();
  //     expect(console.log).toHaveBeenCalledWith(`Sending email to ${createdUser.email}`);
  //     expect(amqpConnection.publish).toHaveBeenCalledWith('exchange', 'routingKey', {
  //       msg: 'User created',
  //       user: createdUser,
  //     });
  //   });
  // });

  describe('findUserById', () => {
    it('should return a user from reqres.in API', async () => {


      const userId = '1';

      const apiResponse = {
          data: {
            id: userId,
            email: 'george.bluth@reqres.in',
            first_name: 'George',
            last_name: 'Bluth',
            avatar: 'https://reqres.in/img/faces/1-image.jpg'
          }
      };

      mockedAxios.get.mockResolvedValue(apiResponse);
      const result = await service.findUserById(userId);
      expect(result).toEqual(apiResponse.data);
      expect(mockedAxios.get).toHaveBeenCalledWith(`https://reqres.in/api/users/${userId}`);
    });
  });

  
});
