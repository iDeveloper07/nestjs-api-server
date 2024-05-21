import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { HttpService } from '@nestjs/axios';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

const mockUser : CreateUserDto = {
  id     : '1',
  name   : 'John Doe',
  email  : 'john.doe@example.com',
  avatar : 'https://reqres.in/img/faces/2-image.jpg'
};

const mockUserNoAvatar : CreateUserDto = {
  id     : '1',
  name   : 'John Doe',
  email  : 'john.doe@example.com'
};

const mockCreatedUser : CreateUserDto = {
  id     : '1',
  name   : 'John Doe',
  email  : 'john.doe@example.com',
  avatar : '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'
}

const mockUserId = '1';

const mockUserAvatar : string = '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';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getModelToken('User'),
          useValue: Model,
        },
        {
          provide: getModelToken('Avatar'),
          useValue: Model,
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('createUser', () => {
    it('should create a user and return it', async () => {

      jest.spyOn(userService, 'createUser').mockResolvedValue(mockCreatedUser);

      const result = await userController.createUser(mockUser);
      expect(result).toEqual(mockCreatedUser);
      expect(userService.createUser).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('getUser', () => {
    it('should return a user from reqres.in API', async () => {

      jest.spyOn(userService, 'findUserById').mockResolvedValue(mockCreatedUser);

      const result = await userController.getUser(mockUserId);
      expect(result).toEqual(mockCreatedUser);
      expect(userService.findUserById).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('getAvatar', () => {
    it('should return a user avatar base64 from db', async () => {

      jest.spyOn(userService, 'getAvatar').mockResolvedValue(mockUserAvatar);

      const result = await userController.getAvatar(mockUserId);
      expect(result).toEqual(mockUserAvatar);
      expect(userService.getAvatar).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('deleteAvatar', () => {
    it('should return a user without avatar info from db', async () => {

      jest.spyOn(userService, 'deleteAvatar').mockResolvedValue(mockUserNoAvatar);

      const result = await userController.deleteAvatar(mockUserId);
      expect(result.avatar).toBeUndefined();
      expect(userService.deleteAvatar).toHaveBeenCalledWith(mockUserId);
    });
  });

});
