// routes/orders.js
const express = require("express");
const supabase = require("../config/supabase");
const authenticate = require("../auth/middleware");
const { BadRequestError, NotFoundError } = require("../errors/customErrors");
const router = express.Router();

// Place an order by converting the contents of the user's cart into an order
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

// Retrieve order details by order ID
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
