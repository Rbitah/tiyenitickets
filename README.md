# TiyeniTickets

TiyeniTickets is a ticketing platform that allows users to purchase tickets and manage transactions through a web application. This project is built using NestJS, TypeORM, and other modern web technologies.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Features

- User authentication and authorization
- Ticket purchasing and management
- Wallet management with transaction history
- Integration with payment services
- Real-time updates with WebSockets
- Comprehensive API documentation with Swagger

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/tiyenitickets.git
   cd tiyeniTickets
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up the database:**

   Ensure you have a MySQL database running and update the connection settings in the `.env` file.

## Configuration

1. **Environment Variables:**

   Create a `.env` file in the root directory and configure the following variables:

   ```plaintext
   DATABASE_HOST=localhost
   DATABASE_PORT=3306
   DATABASE_USER=root
   DATABASE_PASSWORD=yourpassword
   DATABASE_NAME=tiyenitickets
   ```

2. **Other Configurations:**

   - Update `src/config/configuration.ts` for additional settings.
   - Configure Redis settings in `src/config/redis.config.ts` if using Redis.

## Usage

1. **Start the application:**

   ```bash
   npm run start:dev
   ```

2. **Access the application:**

   Open your browser and navigate to `http://localhost:3000`.

3. **API Documentation:**

   Access the Swagger API documentation at `http://localhost:3000/api`.

## Testing

1. **Run tests:**

   ```bash
   npm test
   ```

2. **Run tests with coverage:**

   ```bash
   npm run test:cov
   ```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push to your fork.
4. Submit a pull request with a detailed description of your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.