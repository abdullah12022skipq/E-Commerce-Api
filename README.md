# E-commerce API

This is a simple E-commerce API built using Node.js and Express. The API provides functionalities for product management, cart management, order placement, authentication, and authorization. Data is persisted using Supabase.

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

## API Endpoints

### Authentication

- **Register a new user**

    ```http
    POST /register
    ```

    Request Body:

    ```json
    {
      "email": "user@example.com",
      "password": "password123"
    }
    ```

    Response:

    ```json
    {
      "message": "User registered successfully"
    }
    ```

- **Login**

    ```http
    POST /login
    ```

    Request Body:

    ```json
    {
      "email": "user@example.com",
      "password": "password123"
    }
    ```

    Response:

    ```json
    {
      "token": "jwt-token"
    }
    ```

### Product Management

- **Create a new product**

    ```http
    POST /products
    ```

    Request Body:

    ```json
    {
      "name": "Product Name",
      "description": "Product Description",
      "price": 100,
      "category": "Category"
    }
    ```

    Response:

    ```json
    {
      "id": 1,
      "name": "Product Name",
      "description": "Product Description",
      "price": 100,
      "category": "Category"
    }
    ```

- **Retrieve all products or filter by category**

    ```http
    GET /products
    GET /products?category=Category
    ```

    Response:

    ```json
    [
      {
        "id": 1,
        "name": "Product Name",
        "description": "Product Description",
        "price": 100,
        "category": "Category"
      }
    ]
    ```

- **Update product details**

    ```http
    PUT /products/:id
    ```

    Request Body:

    ```json
    {
      "name": "Updated Product Name",
      "description": "Updated Product Description",
      "price": 150,
      "category": "Updated Category"
    }
    ```

    Response:

    ```json
    {
      "message": "Product updated successfully",
      "product": {
        "id": 1,
        "name": "Updated Product Name",
        "description": "Updated Product Description",
        "price": 150,
        "category": "Updated Category"
      }
    }
    ```

- **Delete a product**

    ```http
    DELETE /products/:id
    ```

    Response:

    ```json
    {
      "message": "Product deleted successfully"
    }
    ```

### Cart Management

- **Create a new cart**

    ```http
    POST /carts
    ```

    Response:

    ```json
    {
      "id": 1,
      "user_id": 1
    }
    ```

- **Add a product to the cart**

    ```http
    POST /carts/:cartId/products
    ```

    Request Body:

    ```json
    {
      "productId": 1,
      "quantity": 2
    }
    ```

    Response:

    ```json
    {
      "cart_id": 1,
      "product_id": 1,
      "quantity": 2
    }
    ```

- **Remove a product from the cart**

    ```http
    DELETE /carts/:cartId/products/:productId
    ```

    Response:

    ```json
    {
      "message": "Product removed from cart"
    }
    ```

- **Retrieve cart contents**

    ```http
    GET /carts/:cartId
    ```

    Response:

    ```json
    [
      {
        "product_id": 1,
        "quantity": 2,
        "product": {
          "id": 1,
          "name": "Product Name",
          "description": "Product Description",
          "price": 100,
          "category": "Category"
        }
      }
    ]
    ```

### Order Placement

- **Place an order by converting the contents of the user's cart into an order**

    ```http
    POST /orders/:cartId
    ```

    Response:

    ```json
    {
      "message": "Order placed successfully",
      "orderId": 1
    }
    ```

- **Retrieve order details by order ID**

    ```http
    GET /orders/:orderId
    ```

    Response:

    ```json
    {
      "id": 1,
      "total_cost": 200,
      "created_at": "2024-01-01T00:00:00Z",
      "order_items": [
        {
          "product_id": 1,
          "quantity": 2,
          "product": {
            "name": "Product Name",
            "description": "Product Description",
            "price": 100,
            "category": "Category"
          }
        }
      ]
    }
    ```

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
