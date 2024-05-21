const express = require("express");
const supabase = require("../config/supabase");
const authenticate = require("../auth/middleware");
const { BadRequestError, NotFoundError } = require("../errors/customErrors");
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Cart:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the cart
 *         user_id:
 *           type: integer
 *           description: The ID of the user who owns the cart
 *       example:
 *         id: 1
 *         user_id: 1
 *     CartItem:
 *       type: object
 *       properties:
 *         cart_id:
 *           type: integer
 *           description: The ID of the cart
 *         product_id:
 *           type: integer
 *           description: The ID of the product
 *         quantity:
 *           type: integer
 *           description: The quantity of the product in the cart
 *         product:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               description: The ID of the product
 *             name:
 *               type: string
 *               description: The name of the product
 *             description:
 *               type: string
 *               description: The description of the product
 *             price:
 *               type: number
 *               description: The price of the product
 *             category:
 *               type: string
 *               description: The category of the product
 *       example:
 *         cart_id: 1
 *         product_id: 1
 *         quantity: 2
 *         product:
 *           id: 1
 *           name: Sample Product
 *           description: This is a sample product
 *           price: 29.99
 *           category: Sample Category
 */

/**
 * @swagger
 * tags:
 *   name: Carts
 *   description: The carts managing API
 */

/**
 * @swagger
 * /carts:
 *   post:
 *     summary: Create a new cart
 *     tags: [Carts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: The cart was created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /carts/{cartId}/products:
 *   post:
 *     summary: Add a product to the cart
 *     tags: [Carts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The cart ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *             example:
 *               productId: 1
 *               quantity: 2
 *     responses:
 *       201:
 *         description: The product was added to the cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItem'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /carts/{cartId}/products/{productId}:
 *   delete:
 *     summary: Remove a product from the cart
 *     tags: [Carts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The cart ID
 *       - in: path
 *         name: productId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The product ID
 *     responses:
 *       200:
 *         description: The product was removed from the cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product removed from cart
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /carts/{cartId}:
 *   get:
 *     summary: Retrieve cart contents
 *     tags: [Carts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The cart ID
 *     responses:
 *       200:
 *         description: Cart contents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CartItem'
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /carts/{cartId}:
 *   delete:
 *     summary: Delete a cart
 *     tags: [Carts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The cart ID
 *     responses:
 *       200:
 *         description: Cart deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cart deleted successfully
 *       500:
 *         description: Internal server error
 */
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
// const { BadRequestError, NotFoundError } = require("../errors/customErrors");
// const router = express.Router();

// // Create a new cart
// router.post("/", authenticate, async (req, res, next) => {
//   const userId = req.user.userId;

//   try {
//     // Check if the user exists
//     const { data: userExists, error: userError } = await supabase
//       .from("users")
//       .select("id")
//       .eq("id", userId)
//       .single();

//     if (userError || !userExists) {
//       return next(new BadRequestError("User does not exist"));
//     }

//     // Insert a new cart
//     const { data, error } = await supabase
//       .from("carts")
//       .insert([{ user_id: userId }])
//       .select(); // Ensure we get the inserted data back

//     if (error) {
//       console.error("Error inserting cart:", error);
//       throw new Error(error.message);
//     }

//     res.status(201).json(data[0]);
//   } catch (error) {
//     console.error("Error creating cart:", error.message);
//     next(error);
//   }
// });

// // Add a product to the cart
// router.post("/:cartId/products", authenticate, async (req, res, next) => {
//   const { cartId } = req.params;
//   const { productId, quantity } = req.body;

//   if (!productId || !quantity) {
//     return next(new BadRequestError("Product ID and quantity are required"));
//   }

//   try {
//     const { data, error } = await supabase
//       .from("cart_items")
//       .insert([{ cart_id: cartId, product_id: productId, quantity }])
//       .select();

//     if (error) {
//       throw new Error(error.message);
//     }

//     res.status(201).json(data[0]);
//   } catch (error) {
//     next(error);
//   }
// });

// // Remove a product from the cart
// router.delete(
//   "/:cartId/products/:productId",
//   authenticate,
//   async (req, res, next) => {
//     const { cartId, productId } = req.params;

//     try {
//       const { data, error } = await supabase
//         .from("cart_items")
//         .delete()
//         .eq("cart_id", cartId)
//         .eq("product_id", productId);

//       if (error) {
//         throw new Error(error.message);
//       }

//       res.status(200).json({ message: "Product removed from cart" });
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// // Retrieve cart contents
// router.get("/:cartId", authenticate, async (req, res, next) => {
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
//       throw new Error(error.message);
//     }

//     res.status(200).json(data);
//   } catch (error) {
//     next(error);
//   }
// });

// // Delete a cart
// router.delete("/:cartId", authenticate, async (req, res, next) => {
//   const { cartId } = req.params;

//   try {
//     // Delete cart items first to avoid foreign key constraint issues
//     const { data: itemsData, error: itemsError } = await supabase
//       .from("cart_items")
//       .delete()
//       .eq("cart_id", cartId);

//     if (itemsError) {
//       throw new Error(itemsError.message);
//     }

//     // Delete the cart
//     const { data, error } = await supabase
//       .from("carts")
//       .delete()
//       .eq("id", cartId);

//     if (error) {
//       throw new Error(error.message);
//     }

//     res.status(200).json({ message: "Cart deleted successfully" });
//   } catch (error) {
//     next(error);
//   }
// });

// module.exports = router;

// 2nd

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
