// import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';

// @Module({
//   imports: [
//     MongooseModule.forRootAsync({
//       useFactory: () => ({
//         uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/nestjs-project',
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//       }),
//     }),
//   ],
// })
// export class MongoDBModule {}

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

 