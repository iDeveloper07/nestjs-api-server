import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoDBConfig } from './mongodb/mongodb.config';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { UserModule } from './user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongoDBConfig,
    }),
    RabbitMQModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
