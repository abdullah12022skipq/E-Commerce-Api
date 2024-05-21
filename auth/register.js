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

// auth/register.js
const bcrypt = require("bcrypt");
const supabase = require("../config/supabase");

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
