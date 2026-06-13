# LeoVegas User Management API

A clean and robust User Management API built with **Node.js**, **TypeScript**, and **NestJS**. This project follows the **JSON:API** specification for consistent data handling and error reporting.

## API Documentation

Once the server is up and running, you can explore the full API documentation and try out the endpoints at:
[http://localhost:3000/swagger](http://localhost:3000/swagger)

## What's Inside?

- **JSON:API Standard:** Everything from data responses to error objects follows the JSON:API spec.
- **Role-Based Access (RBAC):** Built-in support for `USER` and `ADMIN` roles with granular permissions.
- **Fast & Reliable:** Powered by **Fastify** for performance and **Prisma** for type-safe database interactions.
- **Solid Foundation:** Designed with SOLID principles and OOP patterns in mind.

## Getting Started

Getting the project running on your machine is straightforward:

1.  **Set up your environment:**
    Copy the example environment file to create your own `.env` file. This is required for Docker and the app to work:
    ```bash
    cp .env.example .env
    ```

2.  **Spin up the database:**
    ```bash
    docker-compose up -d
    ```

3.  **Setup Prisma:**
    Generate the client and run migrations:
    ```bash
    npm run prisma:generate
    npm run db:migrate:dev
    ```

4.  **Start the engine:**
    ```bash
    npm run dev
    ```

## Running Tests

We take testing seriously. Here are the commands to run the suites:

- **Unit Tests:** `npm run test`
- **End-to-End (E2E):** `npm run test:e2e`
- **Coverage Report:** `npm run test:cov`

## Permissions at a Glance

- **Regular Users:** Can manage their own profile (view/update).
- **Admins:** Full control over all users, including role management and account deletion.
- **Safety First:** Admins cannot delete their own accounts or downgrade their own roles via the admin endpoints.
