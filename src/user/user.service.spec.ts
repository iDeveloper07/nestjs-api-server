import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { HttpService } from '@nestjs/axios';

import axios from 'axios';
import * as fs from 'fs-extra';

jest.mock('axios');
jest.mock('fs-extra');

const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockUserNoAvatar : CreateUserDto = {
  id     : '1',
  name   : 'John Doe',
  email  : 'john.doe@example.com'
};

const createUserDto: CreateUserDto = {
  id     : '1',
  name   : 'John Doe',
  email  : 'john.doe@example.com',
  avatar : 'https://reqres.in/img/faces/1-image.jpg'
};

const mockUserId = '1';

const mockUserAvatar : string = 'mock-avatar-data';

const mockFoundUserResponse = {
  data : {
    id         : '1',
    email      :   'george.bluth@reqres.in',
    first_name : 'George',
    last_name  : 'Bluth',
    avatar     : 'https://reqres.in/img/faces/1-image.jpg'
  }
}

describe('UserService', () => {

  let service     : UserService;
  let userModel   : Model<User>;
  let httpService : HttpService; 

  class MockUserModel {
    constructor(private data: any) {}
    save = jest.fn().mockResolvedValue(this.data);
    static findOne = jest.fn().mockReturnValue({
      exec : jest.fn().mockResolvedValue({ avatar: 'mock-avatar-data' }),
    });
    static findOneAndUpdate = jest.fn().mockReturnValue({
      exec : jest.fn().mockResolvedValue({mockUserNoAvatar}),
    });
  }

  beforeEach(async () => {

    const userModelMock = {
      save : jest.fn(),
    };

    const module : TestingModule = await Test.createTestingModule({
      providers : [
        UserService,
        {
          provide  : getModelToken('User'),
          useValue : MockUserModel,
        },
        {
          provide  : HttpService,
          useValue : {
            get : jest.fn()
          }
        }
      ]
    }).compile();

    service     = module.get<UserService>(UserService);
    userModel   = module.get<Model<User>>(getModelToken('User'));
    httpService = module.get<HttpService>(HttpService);

    jest.spyOn(service, 'sendEmail' as keyof UserService).mockImplementation(async () => {});
    jest.spyOn(service, 'sendRabbitEvent' as keyof UserService).mockImplementation(async () => {});

  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user, send an email, and publish an event', async () => {

      const createdUser = {
        ...createUserDto,
        avatar : 'bW9ja2VkIGltYWdlIGRhdGE='
      };

      jest.spyOn(axios, 'get').mockResolvedValue({ data: 'mocked image data' });
      
      const result = await service.createUser(createUserDto);

      expect((service as any).sendEmail).toHaveBeenCalledWith(createUserDto.email);
      expect((service as any).sendRabbitEvent).toHaveBeenCalledWith(createUserDto.id);
      expect(result).toEqual(createdUser);
    });
  });

  describe('findUserById', () => {
    it('should return a user from reqres.in API', async () => {

      mockedAxios.get.mockResolvedValue(mockFoundUserResponse);

      const result = await service.findUserById(mockUserId);

      expect(result).toEqual(mockFoundUserResponse.data);
      expect(mockedAxios.get).toHaveBeenCalledWith(`https://reqres.in/api/users/${mockUserId}`);
    });
  });

  describe('getAvatar', () => {
    it('should return the avatar as base64', async () => {

      const result = await service.getAvatar(mockUserId);
      expect(result).toEqual(mockUserAvatar);
    });
  });

  describe('deleteAvatar', () => {

    it('should return a user without avatar info from db', async () => {

      const filePath  = `./avatars/${mockUserId}.png`;
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      const result    = await service.deleteAvatar(mockUserId);

      expect(fs.unlink).toHaveBeenCalledWith(filePath);
      expect(MockUserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id : mockUserId },
        { $unset : { avatar : 1 } }
      );
      expect(MockUserModel.findOneAndUpdate().exec).toHaveBeenCalled();
      expect(result).toEqual({mockUserNoAvatar});

    });
  });
  
});
