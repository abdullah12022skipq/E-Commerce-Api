// routes/products.js
const express = require("express");
const supabase = require("../config/supabase");
const authenticate = require("../auth/middleware");
const router = express.Router();
const { BadRequestError, NotFoundError } = require("../errors/customErrors");

// Create a new product
/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The product name
 *               description:
 *                 type: string
 *                 description: The product description
 *               price:
 *                 type: number
 *                 description: The product price
 *               category:
 *                 type: string
 *                 description: The product category
 *             example:
 *               name: Sample Product
 *               description: This is a sample product
 *               price: 19.99
 *               category: Electronics
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The product ID
 *                 name:
 *                   type: string
 *                   description: The product name
 *                 description:
 *                   type: string
 *                   description: The product description
 *                 price:
 *                   type: number
 *                   description: The product price
 *                 category:
 *                   type: string
 *                   description: The product category
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
router.post("/", authenticate, async (req, res, next) => {
  const { name, description, price, category } = req.body;

  if (!name || !price) {
    return next(new BadRequestError("Name and price are required"));
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .insert([{ name, description, price, category }])
      .select(); // Ensure we get the inserted data back

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      throw new Error("Failed to insert product");
    }

    res.status(201).json(data[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Retrieve all products or filter by category
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category to filter by
 *     responses:
 *       200:
 *         description: The list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Internal server error
 */
router.get("/", async (req, res, next) => {
  const { category } = req.query;

  try {
    const query = supabase.from("products").select("*");

    if (category) {
      query.eq("category", category);
    }

    const { data, error } = await query;

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
 * /products/{id}:
 *   put:
 *     summary: Update product details
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", authenticate, async (req, res, next) => {
  const { id } = req.params;
  const { name, description, price, category } = req.body;

  try {
    // Check if the product exists
    const { data: existingProduct, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingProduct) {
      return next(new NotFoundError("Product not found"));
    }

    // Update the product
    const { data: updatedData, error: updateError } = await supabase
      .from("products")
      .update({ name, description, price, category })
      .eq("id", id)
      .select();

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Check if the update was successful and return the updated product
    if (!updatedData || updatedData.length === 0) {
      return res.status(500).json({ error: "Failed to update product" });
    }

    res.json({
      message: "Product updated successfully",
      product: updatedData[0],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", authenticate, async (req, res, next) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

// // routes/products.js
// const express = require("express");
// const supabase = require("../config/supabase");
// const authenticate = require("../auth/middleware");
// const router = express.Router();
// const { BadRequestError, NotFoundError } = require("../errors/customErrors");

// // Create a new product
// router.post("/", authenticate, async (req, res, next) => {
//   const { name, description, price, category } = req.body;

//   if (!name || !price) {
//     return next(new BadRequestError("Name and price are required"));
//   }

//   try {
//     const { data, error } = await supabase
//       .from("products")
//       .insert([{ name, description, price, category }]);

//     if (error) {
//       throw new Error(error.message);
//     }

//     res.status(201).json(data[0]);
//   } catch (error) {
//     next(error);
//   }
// });

// // Retrieve all products or filter by category
// router.get("/", async (req, res, next) => {
//   const { category } = req.query;

//   try {
//     const query = supabase.from("products").select("*");

//     if (category) {
//       query.eq("category", category);
//     }

//     const { data, error } = await query;

//     if (error) {
//       throw new Error(error.message);
//     }

//     res.status(200).json(data);
//   } catch (error) {
//     next(error);
//   }
// });

// // Update product details
// router.put("/:id", authenticate, async (req, res, next) => {
//   const { id } = req.params;
//   const { name, description, price, category } = req.body;

//   try {
//     // Check if the product exists
//     const { data: existingProduct, error: fetchError } = await supabase
//       .from("products")
//       .select("*")
//       .eq("id", id)
//       .single();

//     if (fetchError || !existingProduct) {
//       return next(new NotFoundError("Product not found"));
//     }

//     // Update the product
//     const { data: updatedData, error: updateError } = await supabase
//       .from("products")
//       .update({ name, description, price, category })
//       .eq("id", id)
//       .select();

//     if (updateError) {
//       throw new Error(updateError.message);
//     }

//     // Check if the update was successful and return the updated product
//     if (!updatedData || updatedData.length === 0) {
//       return res.status(500).json({ error: "Failed to update product" });
//     }

//     res.json({
//       message: "Product updated successfully",
//       product: updatedData[0],
//     });
//   } catch (error) {
//     next(error);
//   }
// });

// // Delete a product
// router.delete("/:id", authenticate, async (req, res, next) => {
//   const { id } = req.params;

//   try {
//     const { data, error } = await supabase
//       .from("products")
//       .delete()
//       .eq("id", id);

//     if (error) {
//       throw new Error(error.message);
//     }

//     res.status(200).json({ message: "Product deleted successfully" });
//   } catch (error) {
//     next(error);
//   }
// });

// module.exports = router;

// 2nd
// // routes/products.js
// const express = require("express");
// const supabase = require("../config/supabase");
// const authenticate = require("../auth/middleware");
// const router = express.Router();
// const { BadRequestError, NotFoundError } = require("../errors/customErrors");

// // Create a new product
// router.post("/", authenticate, async (req, res) => {
//   const { name, description, price, category } = req.body;

//   if (!name || !price) {
//     return next(new BadRequestError("Name and price are required"));
//   }

//   try {
//     const { data, error } = await supabase
//       .from("products")
//       .insert([{ name, description, price, category }]);

//     if (error) {
//       throw new Error(error.message);
//     }

//     res.status(201).json(data[0]);
//   } catch (error) {
//     next(error);
//   }
// });

// // Retrieve all products or filter by category
// router.get("/", async (req, res) => {
//   const { category } = req.query;

//   try {
//     const query = supabase.from("products").select("*");

//     if (category) {
//       query.eq("category", category);
//     }

//     const { data, error } = await query;

//     if (error) {
//       throw new Error(error.message);
//     }

//     res.status(200).json(data);
//   } catch (error) {
//     next(error);
//   }
// });

// // Update product details
// router.put("/:id", authenticate, async (req, res) => {
//   const { id } = req.params;
//   const { name, description, price, category } = req.body;

//   try {
//     // Check if the product exists
//     const { data: existingProduct, error: fetchError } = await supabase
//       .from("products")
//       .select("*")
//       .eq("id", id)
//       .single();

//     if (fetchError || !existingProduct) {
//       return next(new NotFoundError("Product not found"));
//     }

//     // Update the product
//     const { data: updatedData, error: updateError } = await supabase
//       .from("products")
//       .update({ name, description, price, category })
//       .eq("id", id)
//       .select();

//     if (updateError) {
//       throw new Error(updateError.message);
//     }

//     // Check if the update was successful and return the updated product
//     if (!updatedData || updatedData.length === 0) {
//       return res.status(500).json({ error: "Failed to update product" });
//     }

//     res.json({
//       message: "Product updated successfully",
//       product: updatedData[0],
//     });
//   } catch (error) {
//     next(error);
//   }
// });

// // Delete a product
// router.delete("/:id", authenticate, async (req, res) => {
//   const { id } = req.params;

//   try {
//     const { data, error } = await supabase
//       .from("products")
//       .delete()
//       .eq("id", id);

//     if (error) {
//       throw new Error(error.message);
//     }

//     res.status(200).json({ message: "Product deleted successfully" });
//   } catch (error) {
//     next(error);
//   }
// });

// module.exports = router;
