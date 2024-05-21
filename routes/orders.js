const express = require("express");
const supabase = require("../config/supabase");
const authenticate = require("../auth/middleware");
const { BadRequestError, NotFoundError } = require("../errors/customErrors");
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the order
 *         total_cost:
 *           type: number
 *           description: The total cost of the order
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the order was created
 *         order_items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: integer
 *                 description: The ID of the product
 *               quantity:
 *                 type: integer
 *                 description: The quantity of the product in the order
 *               product:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: The name of the product
 *                   description:
 *                     type: string
 *                     description: The description of the product
 *                   price:
 *                     type: number
 *                     description: The price of the product
 *                   category:
 *                     type: string
 *                     description: The category of the product
 *       example:
 *         id: 1
 *         total_cost: 99.99
 *         created_at: 2024-05-17T00:00:00Z
 *         order_items:
 *           - product_id: 1
 *             quantity: 2
 *             product:
 *               name: Sample Product
 *               description: This is a sample product
 *               price: 29.99
 *               category: Sample Category
 */

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: The orders managing API
 */

/**
 * @swagger
 * /orders/{cartId}:
 *   post:
 *     summary: Place an order by converting the contents of the user's cart into an order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The cart ID
 *     responses:
 *       201:
 *         description: Order placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order placed successfully
 *                 orderId:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/:cartId", authenticate, async (req, res, next) => {
  const { cartId } = req.params;
  const userId = req.user.userId;

  try {
    // Retrieve cart items
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select(
        `
        product_id,
        quantity,
        product:products (
          price
        )
      `
      )
      .eq("cart_id", cartId);

    if (cartError) {
      return next(new Error(cartError.message));
    }

    if (cartItems.length === 0) {
      return next(new BadRequestError("Cart is empty"));
    }

    // Calculate total cost
    const totalCost = cartItems.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );

    // Create order
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([{ user_id: userId, total_cost: totalCost }])
      .select();

    if (orderError) {
      return next(new Error(orderError.message));
    }

    const orderId = orderData[0].id;

    // Add order items
    const orderItems = cartItems.map((item) => ({
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
    }));

    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (orderItemsError) {
      return next(new Error(orderItemsError.message));
    }

    // Clear cart
    const { error: clearCartError } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cartId);

    if (clearCartError) {
      return next(new Error(clearCartError.message));
    }

    res.status(201).json({ message: "Order placed successfully", orderId });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /orders/{orderId}:
 *   get:
 *     summary: Retrieve order details by order ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The order ID
 *     responses:
 *       200:
 *         description: Order details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.get("/:orderId", authenticate, async (req, res, next) => {
  const { orderId } = req.params;

  try {
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
        id,
        total_cost,
        created_at,
        order_items (
          product_id,
          quantity,
          product:products (
            name,
            description,
            price,
            category
          )
        )
      `
      )
      .eq("id", orderId)
      .single();

    if (orderError) {
      return next(new NotFoundError("Order not found"));
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

// // routes/orders.js
// const express = require("express");
// const supabase = require("../config/supabase");
// const authenticate = require("../auth/middleware");
// const { BadRequestError, NotFoundError } = require("../errors/customErrors");
// const router = express.Router();

// // Place an order by converting the contents of the user's cart into an order
// router.post("/:cartId", authenticate, async (req, res, next) => {
//   const { cartId } = req.params;
//   const userId = req.user.userId;

//   try {
//     // Retrieve cart items
//     const { data: cartItems, error: cartError } = await supabase
//       .from("cart_items")
//       .select(
//         `
//         product_id,
//         quantity,
//         product:products (
//           price
//         )
//       `
//       )
//       .eq("cart_id", cartId);

//     if (cartError) {
//       return next(new Error(cartError.message));
//     }

//     if (cartItems.length === 0) {
//       return next(new BadRequestError("Cart is empty"));
//     }

//     // Calculate total cost
//     const totalCost = cartItems.reduce(
//       (sum, item) => sum + item.quantity * item.product.price,
//       0
//     );

//     // Create order
//     const { data: orderData, error: orderError } = await supabase
//       .from("orders")
//       .insert([{ user_id: userId, total_cost: totalCost }])
//       .select();

//     if (orderError) {
//       return next(new Error(orderError.message));
//     }

//     const orderId = orderData[0].id;

//     // Add order items
//     const orderItems = cartItems.map((item) => ({
//       order_id: orderId,
//       product_id: item.product_id,
//       quantity: item.quantity,
//     }));

//     const { error: orderItemsError } = await supabase
//       .from("order_items")
//       .insert(orderItems);

//     if (orderItemsError) {
//       return next(new Error(orderItemsError.message));
//     }

//     // Clear cart
//     const { error: clearCartError } = await supabase
//       .from("cart_items")
//       .delete()
//       .eq("cart_id", cartId);

//     if (clearCartError) {
//       return next(new Error(clearCartError.message));
//     }

//     res.status(201).json({ message: "Order placed successfully", orderId });
//   } catch (error) {
//     next(error);
//   }
// });

// // Retrieve order details by order ID
// router.get("/:orderId", authenticate, async (req, res, next) => {
//   const { orderId } = req.params;

//   try {
//     const { data: order, error: orderError } = await supabase
//       .from("orders")
//       .select(
//         `
//         id,
//         total_cost,
//         created_at,
//         order_items (
//           product_id,
//           quantity,
//           product:products (
//             name,
//             description,
//             price,
//             category
//           )
//         )
//       `
//       )
//       .eq("id", orderId)
//       .single();

//     if (orderError) {
//       return next(new NotFoundError("Order not found"));
//     }

//     res.status(200).json(order);
//   } catch (error) {
//     next(error);
//   }
// });

// module.exports = router;

// 2nd
// // routes/orders.js
// const express = require("express");
// const supabase = require("../config/supabase");
// const authenticate = require("../auth/middleware");
// const router = express.Router();

// // Place an order by converting the contents of the user's cart into an order
// router.post("/:cartId", authenticate, async (req, res) => {
//   const { cartId } = req.params;
//   const userId = req.user.userId;

//   try {
//     // Retrieve cart items
//     const { data: cartItems, error: cartError } = await supabase
//       .from("cart_items")
//       .select(
//         `
//         product_id,
//         quantity,
//         product:products (
//           price
//         )
//       `
//       )
//       .eq("cart_id", cartId);

//     if (cartError) {
//       throw cartError;
//     }

//     if (cartItems.length === 0) {
//       return res.status(400).json({ error: "Cart is empty" });
//     }

//     // Calculate total cost
//     const totalCost = cartItems.reduce(
//       (sum, item) => sum + item.quantity * item.product.price,
//       0
//     );

//     // Create order
//     const { data: orderData, error: orderError } = await supabase
//       .from("orders")
//       .insert([{ user_id: userId, total_cost: totalCost }])
//       .select();

//     if (orderError) {
//       throw orderError;
//     }

//     const orderId = orderData[0].id;

//     // Add order items
//     const orderItems = cartItems.map((item) => ({
//       order_id: orderId,
//       product_id: item.product_id,
//       quantity: item.quantity,
//     }));

//     const { error: orderItemsError } = await supabase
//       .from("order_items")
//       .insert(orderItems);

//     if (orderItemsError) {
//       throw orderItemsError;
//     }

//     // Clear cart
//     const { error: clearCartError } = await supabase
//       .from("cart_items")
//       .delete()
//       .eq("cart_id", cartId);

//     if (clearCartError) {
//       throw clearCartError;
//     }

//     res.status(201).json({ message: "Order placed successfully", orderId });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Retrieve order details by order ID
// router.get("/:orderId", authenticate, async (req, res) => {
//   const { orderId } = req.params;

//   try {
//     const { data: order, error: orderError } = await supabase
//       .from("orders")
//       .select(
//         `
//         id,
//         total_cost,
//         created_at,
//         order_items (
//           product_id,
//           quantity,
//           product:products (
//             name,
//             description,
//             price,
//             category
//           )
//         )
//       `
//       )
//       .eq("id", orderId)
//       .single();

//     if (orderError) {
//       throw orderError;
//     }

//     res.status(200).json(order);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;
