// routes/carts.js
const express = require("express");
const supabase = require("../config/supabase");
const authenticate = require("../auth/middleware");
const { BadRequestError, NotFoundError } = require("../errors/customErrors");
const router = express.Router();

// Create a new cart
router.post("/", authenticate, async (req, res, next) => {
  const userId = req.user.userId;

  try {
    // Check if the user exists
    const { data: userExists, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (userError || !userExists) {
      return next(new BadRequestError("User does not exist"));
    }

    // Insert a new cart
    const { data, error } = await supabase
      .from("carts")
      .insert([{ user_id: userId }])
      .select(); // Ensure we get the inserted data back

    if (error) {
      console.error("Error inserting cart:", error);
      throw new Error(error.message);
    }

    res.status(201).json(data[0]);
  } catch (error) {
    console.error("Error creating cart:", error.message);
    next(error);
  }
});

// Add a product to the cart
router.post("/:cartId/products", authenticate, async (req, res, next) => {
  const { cartId } = req.params;
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return next(new BadRequestError("Product ID and quantity are required"));
  }

  try {
    const { data, error } = await supabase
      .from("cart_items")
      .insert([{ cart_id: cartId, product_id: productId, quantity }])
      .select();

    if (error) {
      throw new Error(error.message);
    }

    res.status(201).json(data[0]);
  } catch (error) {
    next(error);
  }
});

// Remove a product from the cart
router.delete(
  "/:cartId/products/:productId",
  authenticate,
  async (req, res, next) => {
    const { cartId, productId } = req.params;

    try {
      const { data, error } = await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", cartId)
        .eq("product_id", productId);

      if (error) {
        throw new Error(error.message);
      }

      res.status(200).json({ message: "Product removed from cart" });
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve cart contents
router.get("/:cartId", authenticate, async (req, res, next) => {
  const { cartId } = req.params;

  try {
    const { data, error } = await supabase
      .from("cart_items")
      .select(
        `
        product_id,
        quantity,
        product:products (
          id,
          name,
          description,
          price,
          category
        )
      `
      )
      .eq("cart_id", cartId);

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

// Delete a cart
router.delete("/:cartId", authenticate, async (req, res, next) => {
  const { cartId } = req.params;

  try {
    // Delete cart items first to avoid foreign key constraint issues
    const { data: itemsData, error: itemsError } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cartId);

    if (itemsError) {
      throw new Error(itemsError.message);
    }

    // Delete the cart
    const { data, error } = await supabase
      .from("carts")
      .delete()
      .eq("id", cartId);

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({ message: "Cart deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

// // routes/carts.js
// const express = require("express");
// const supabase = require("../config/supabase");
// const authenticate = require("../auth/middleware");
// const router = express.Router();

// // Create a new cart
// router.post("/", authenticate, async (req, res) => {
//   const userId = req.user.userId;

//   try {
//     // Check if the user exists
//     const { data: userExists, error: userError } = await supabase
//       .from("users")
//       .select("id")
//       .eq("id", userId)
//       .single();

//     if (userError || !userExists) {
//       return res.status(400).json({ error: "User does not exist" });
//     }

//     // Insert a new cart
//     const { data, error } = await supabase
//       .from("carts")
//       .insert([{ user_id: userId }])
//       .select(); // Ensure we get the inserted data back

//     if (error) {
//       console.error("Error inserting cart:", error);
//       throw error;
//     }

//     res.status(201).json(data[0]);
//   } catch (error) {
//     console.error("Error creating cart:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Add a product to the cart
// router.post("/:cartId/products", authenticate, async (req, res) => {
//   const { cartId } = req.params;
//   const { productId, quantity } = req.body;

//   if (!productId || !quantity) {
//     return res
//       .status(400)
//       .json({ error: "Product ID and quantity are required" });
//   }

//   try {
//     const { data, error } = await supabase
//       .from("cart_items")
//       .insert([{ cart_id: cartId, product_id: productId, quantity }])
//       .select();

//     if (error) {
//       throw error;
//     }

//     res.status(201).json(data[0]);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Remove a product from the cart
// router.delete(
//   "/:cartId/products/:productId",
//   authenticate,
//   async (req, res) => {
//     const { cartId, productId } = req.params;

//     try {
//       const { data, error } = await supabase
//         .from("cart_items")
//         .delete()
//         .eq("cart_id", cartId)
//         .eq("product_id", productId);

//       if (error) {
//         throw error;
//       }

//       res.status(200).json({ message: "Product removed from cart" });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }
// );

// // Retrieve cart contents
// router.get("/:cartId", authenticate, async (req, res) => {
//   const { cartId } = req.params;

//   try {
//     const { data, error } = await supabase
//       .from("cart_items")
//       .select(
//         `
//         product_id,
//         quantity,
//         product:products (
//           id,
//           name,
//           description,
//           price,
//           category
//         )
//       `
//       )
//       .eq("cart_id", cartId);

//     if (error) {
//       throw error;
//     }

//     res.status(200).json(data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// router.delete("/:cartId", authenticate, async (req, res) => {
//   const { cartId } = req.params;

//   try {
//     // Delete cart items first to avoid foreign key constraint issues
//     const { data: itemsData, error: itemsError } = await supabase
//       .from("cart_items")
//       .delete()
//       .eq("cart_id", cartId);

//     if (itemsError) {
//       throw itemsError;
//     }

//     // Delete the cart
//     const { data, error } = await supabase
//       .from("carts")
//       .delete()
//       .eq("id", cartId);

//     if (error) {
//       throw error;
//     }

//     res.status(200).json({ message: "Cart deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;
