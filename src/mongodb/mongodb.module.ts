import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoDBConfig } from './mongodb.config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongoDBConfig,
    }),
  ],
})
export class MongoDBModule {}

 