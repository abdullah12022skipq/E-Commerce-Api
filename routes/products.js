// routes/products.js
const express = require("express");
const supabase = require("../config/supabase");
const authenticate = require("../auth/middleware");
const router = express.Router();
const { BadRequestError, NotFoundError } = require("../errors/customErrors");

// Create a new product
router.post("/", authenticate, async (req, res, next) => {
  const { name, description, price, category } = req.body;

  if (!name || !price) {
    return next(new BadRequestError("Name and price are required"));
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .insert([{ name, description, price, category }]);

    if (error) {
      throw new Error(error.message);
    }

    res.status(201).json(data[0]);
  } catch (error) {
    next(error);
  }
});

// Retrieve all products or filter by category
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

// Update product details
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

// Delete a product
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
