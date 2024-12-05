# RootXL Microservice | NestJS

## Description <!-- omit in toc -->

RootXL Microservice is a powerful NestJS-based microservice designed for the RootXL platform. It integrates MongoDB, RabbitMQ, and Redis to provide a robust and scalable backend solution. This service is built to handle complex workflows and data management needs efficiently.

## Architecture

The RootXL Microservice employs a microservice architecture that leverages:

- **MongoDB**: A flexible and scalable database for primary data storage.
- **RabbitMQ**: Implements robust message queuing for asynchronous communication between microservices, ensuring reliable task management.
- **Redis**: Provides efficient caching for frequently accessed data, improving response times and reducing load on the database.

## Getting Started

Follow these steps to get the service running for local development:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Build the project and verify there are no errors:
   ```bash
   npm run build
   ```
3. Start the service locally:
   ```bash
   npm start
   ```

Ensure you have MongoDB, RabbitMQ, and Redis running and properly configured before starting the service. Configuration details can be set in the `.env` file.

## Support

If you have any questions or need assistance, feel free to reach out to the development team or refer to the [documentation](/docs/readme.md) for detailed guidance.
