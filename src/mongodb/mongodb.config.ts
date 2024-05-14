// import { Injectable } from '@nestjs/common';
// import { MongooseOptionsFactory, MongooseModuleOptions } from '@nestjs/mongoose';

// @Injectable()
// export class MongoDBConfig implements MongooseOptionsFactory {
//   createMongooseOptions(): MongooseModuleOptions {
//     return {
//       uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/nestjs-project',
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     };
//   }
// }

import { Injectable } from '@nestjs/common';
import { MongooseOptionsFactory, MongooseModuleOptions } from '@nestjs/mongoose';

@Injectable()
export class MongoDBConfig implements MongooseOptionsFactory {
  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/nestjs-project'
    };
  }
}

