// testConnection.js
const supabase = require("./config/supabase");

const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .limit(1);

    if (error) {
      throw error;
    }

    console.log("Database connection successful:", data);
  } catch (error) {
    console.error("Error testing database connection:", error.message);
  }
};

testConnection();
