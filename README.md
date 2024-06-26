# E-commerce API

This is an E-commerce API built using Node.js and Express. The API provides functionalities for product management, cart management, order placement, authentication, and authorization. Data is persisted using Supabase.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Product Management](#product-management)
  - [Cart Management](#cart-management)
  - [Order Placement](#order-placement)
- [Error Handling](#error-handling)
- [Swagger Documentation](#swagger-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/your-username/ecommerce-api.git
    cd ecommerce-api
    ```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Set up environment variables:

    Create a `.env` file in the root of the project and add the following variables:

    ```env
    SUPABASE_URL=your-supabase-url
    SUPABASE_KEY=your-supabase-key
    JWT_SECRET=your-jwt-secret
    ```

4. Initialize the database schema in Supabase:

    Create the necessary tables in your Supabase project:

    - Users
    - Products
    - Carts
    - CartItems
    - Orders
    - OrderItems

## Usage

1. Start the server:

    ```sh
    npm start
    ```

2. The API will be available at `http://localhost:3000`.

## OR

## Base URL

The API is deployed on Railway Cloud and can be accessed at:    `https://e-commerce-api-production-dc2f.up.railway.app`

## API Endpoints

### User Registration
#### POST /auth/register
![User Registration](docs/screenshots/register.png)

### User Login
#### POST /auth/login
![User Login](docs/screenshots/login.png)

### Create a New Product
#### POST /products
![Create Product](docs/screenshots/create_product.png)

### Retrieve All Products
#### GET /products
![Retrieve Products](docs/screenshots/retrieve_products.png)

### Update a Product
#### PUT /products/:id
![Update Product](docs/screenshots/update_product.png)

### Delete a Product
#### DELETE /products/:id
![Delete Product](docs/screenshots/delete_product.png)

### Create a New Cart
#### POST /carts
![Create Cart](docs/screenshots/create_cart.png)

### Add a Product to the Cart
#### POST /carts/:cartId/products
![Add Product to Cart](docs/screenshots/add_product_to_cart.png)

### Remove a Product from the Cart
#### DELETE /carts/:cartId/products/:productId
![Remove Product from Cart](docs/screenshots/remove_product_from_cart.png)

### Retrieve Cart Contents
#### GET /carts/:cartId
![Retrieve Cart Contents](docs/screenshots/retrieve_cart_contents.png)

### Place an Order
#### POST /orders/:cartId
![Place Order](docs/screenshots/place_order.png)

### Retrieve Order Details
#### GET /orders/:orderId
![Retrieve Order Details](docs/screenshots/retrieve_order_details.png)


## Error Handling

The API uses centralized error handling middleware to return appropriate HTTP status codes and error messages for different scenarios. Custom error classes are used to represent different error types.

## Swagger Documentation

The API is documented using Swagger. You can access the Swagger UI at `http://localhost:3000/api-docs`.

## Deployment

### Docker Deployment

1. Build the Docker image:

    ```sh
    docker build -t ecommerce-api .
    ```

2. Run the Docker container:

    ```sh
    docker run -p 3000:3000 -d ecommerce-api
    ```

### Railway Deployment

1. Push the Docker image to a container registry.
2. Set up a new project on Railway.
3. Configure environment variables on Railway.
4. Deploy the Docker image from the container registry.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with your improvements.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
