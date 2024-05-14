import { Module } from '@nestjs/common';
import * as amqp from 'amqplib';

@Module({
  providers: [
    {
      provide: 'RABBITMQ_CONNECTION',
      useFactory: async () => {
        return await amqp.connect(process.env.RABBITMQ_URI || 'amqp://localhost');
      },
    },
  ],
  exports: ['RABBITMQ_CONNECTION'],
})
export class RabbitMQModule {}
