const bcrypt = require("bcrypt");
const supabase = require("../config/supabase");

/**
 * @swagger
 * components:
 *   schemas:
 *     UserRegistration:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: The user's email
 *         password:
 *           type: string
 *           description: The user's password
 *       example:
 *         email: user@example.com
 *         password: password123
 */

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegistration'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Email and password are required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
const register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert([{ email, password_hash: hashedPassword }]);

    if (error) {
      throw error;
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = register;

// const bcrypt = require("bcrypt");
// const supabase = require("../config/supabase");

// const register = async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     res.status(400).json({ error: "Email and password are required" });
//   }

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const { data, error } = await supabase
//       .from("users")
//       .insert([{ email, password_hash: hashedPassword }]);

//     if (error) {
//       throw error;
//     }

//     res.status(201).json({ message: "User Registered Successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// module.exports = register;

// 2nd
// // auth/register.js
// const bcrypt = require("bcrypt");
// const supabase = require("../config/supabase");

// const register = async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ error: "Email and password are required" });
//   }

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const { data, error } = await supabase
//       .from("users")
//       .insert([{ email, password_hash: hashedPassword }]);

//     if (error) {
//       throw error;
//     }

//     res.status(201).json({ message: "User registered successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// module.exports = register;
