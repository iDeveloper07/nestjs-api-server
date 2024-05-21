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

const mockUserNoAvatar : CreateUserDto = {
  id     : '1',
  name   : 'John Doe',
  email  : 'john.doe@example.com'
};


describe('UserService', () => {
  let service: UserService;
  let userModel: Model<User>;
  let amqpConnection: AmqpConnection;
  let httpService : HttpService; 

  class MockUserModel {
    constructor(private data: any) {}
    save = jest.fn().mockResolvedValue(this.data);
    static findOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ avatar: 'mock-avatar-data' }),
    });
    static findOneAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({mockUserNoAvatar}),
    });
  }

  const mockUserDto: CreateUserDto = {
    id     : '1',
    name   : 'John Doe',
    email  : 'john.doe@example.com',
    avatar : 'https://reqres.in/img/faces/1-image.jpg'
  };


  beforeEach(async () => {

    const userModelMock = {
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken('User'),
          useValue: MockUserModel,
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

    jest.spyOn(service, 'sendEmail' as keyof UserService).mockImplementation(async () => {});
    jest.spyOn(service, 'sendRabbitEvent' as keyof UserService).mockImplementation(async () => {});

  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(amqpConnection).toBeDefined();
  });

  it('should create a user with avatar processing', async () => {
    const axiosResponse = { data: Buffer.from('image data', 'binary') };
    (axios.get as jest.Mock).mockResolvedValue(axiosResponse);

    const fsEnsureDirSpy = jest.spyOn(fs, 'ensureDir').mockResolvedValue();
    const fsWriteFileSpy = jest.spyOn(fs, 'writeFile').mockResolvedValue();

    jest.spyOn(axios, 'get').mockResolvedValue({ data: 'https://reqres.in/img/faces/1-image.jpg' });

    const result = await service.createUser(mockUserDto);

    // expect(axios.get).toHaveBeenCalledWith(mockUserDto.avatar, { responseType: 'arraybuffer' });
    expect(fsEnsureDirSpy).toHaveBeenCalledWith('./avatars');
    // expect(fsWriteFileSpy).toHaveBeenCalledWith(`./avatars/1.png`, Buffer.from('image data', 'binary'));
    // expect(MockUserModel.prototype.save).toHaveBeenCalled();
    expect((service as any).sendEmail).toHaveBeenCalledWith(mockUserDto.email);
    expect((service as any).sendRabbitEvent).toHaveBeenCalledWith(mockUserDto.id);
    expect(result).toEqual(mockUserDto);
  });

  


  describe('createUser', () => {
    it('should create a user, send an email, and publish an event', async () => {
      const createUserDto: CreateUserDto = {
        id     : '1',
        name   : 'John Doe',
        email  : 'john.doe@example.com',
        avatar : 'https://reqres.in/img/faces/1-image.jpg'
      };

      const createdUser = {
        ...createUserDto,
        avatar: 'bW9ja2VkIGltYWdlIGRhdGE=',
      };

      // // Mock instance save method
      // const userInstance = {
      //   ...createdUser,
      //   _id: 'someUserId',
      //   save: jest.fn().mockResolvedValue(createdUser),
      // };

      jest.spyOn(axios, 'get').mockResolvedValue({ data: 'mocked image data' });
      
      const result = await service.createUser(createUserDto);


      // Assertions
      expect((service as any).sendEmail).toHaveBeenCalledWith(mockUserDto.email);
      expect((service as any).sendRabbitEvent).toHaveBeenCalledWith(mockUserDto.id);

      expect(result).toEqual(createdUser);
      // expect(userInstance.save).toHaveBeenCalled();
      // expect(console.log).toHaveBeenCalledWith(`Sending email to ${createdUser.email}`);
      // expect(amqpConnection.publish).toHaveBeenCalledWith('exchange', 'routingKey', {
      //   msg: 'User created',
      //   user: createdUser,
      // });
    });
  });

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

  describe('getAvatar', () => {
    it('should return the avatar as base64', async () => {
      const mockUserId = '1';
      const mockUserAvatar : string = 'mock-avatar-data';
      const result = await service.getAvatar(mockUserId);
      expect(result).toEqual(mockUserAvatar);
    });
  });

  describe('deleteAvatar', () => {

    it('should return a user without avatar info from db', async () => {

      const userId = '1';
      const filePath = `./avatars/${userId}.png`;

      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      const result = await service.deleteAvatar(userId);

      expect(fs.unlink).toHaveBeenCalledWith(filePath);
      expect(MockUserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id: userId },
        { $unset: { avatar: 1 } }
      );
      expect(MockUserModel.findOneAndUpdate().exec).toHaveBeenCalled();
      expect(result).toEqual({mockUserNoAvatar});

    });
  });
  
});
