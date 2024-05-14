export class RabbitMQConfig {
    uri: string;
  
    constructor() {
      this.uri = process.env.RABBITMQ_URI || 'amqp://localhost';
    }
  }
  