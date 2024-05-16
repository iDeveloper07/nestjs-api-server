import { Controller, Post, Body, Get, Param, Delete, Scope, HttpStatus, Query, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    console.log(createUserDto);
    return await this.userService.createUser(createUserDto);
  }

  @Get(':userId')
  async getUser(@Param('userId') userId: string): Promise<User> {
    return await this.userService.findUserById(userId);
  }

  @Get(':userId/avatar')
  async getAvatar(@Param('userId') userId: string): Promise<string> {
    return await this.userService.getAvatar(userId);
  }

  @Delete(':userId/avatar')
  async deleteAvatar(@Param('userId') userId: string): Promise<any> {
    return await this.userService.deleteAvatar(userId);
  }

}
