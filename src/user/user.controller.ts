import { Controller, Post, Body, Get, Param, Delete, HttpException, HttpStatus, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  // async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
  async createUser(
    @Query('name') name: string, 
    @Query('email') email: string,
    @Query('avatar') avatar?: string
    ): Promise<User> {
    
    // async createUser(@Param('name') name: string, @Param('email') email: string): Promise<User> {
    return await this.userService.createUser(name, email, avatar);
    // return await this.userService.createUser(createUserDto);
  }

  @Get(':userId')
  async getUser(@Param('userId') userId: string): Promise<User> {
    return await this.userService.findUserById(userId);
  }

  @Get(':userId/avatar')
  async getAvatar(@Param('userId') userId: string): Promise<string> {
    return await this.userService.getAvatar(userId);
  }

    // @Get(':userId')
    // async getUser(@Param('userId') userId: string): Promise<User> {
    // try {
    //     // Try to fetch user data from the external API
    //     const user = await this.userService.getUserFromExternalApi(userId);
    //     return user;
    // } catch (error) {
    //     // Handle error if user is not found or any other error occurs
    //     throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    // }
    // }

//   @Delete(':userId')
//   async deleteUser(@Param('userId') userId: string): Promise<User> {
//     return await this.userService.deleteUser(userId);
//   }

  // Add more HTTP methods for user operations
}
