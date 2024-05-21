require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const register = require("./auth/register");
const login = require("./auth/login");
const authenticate = require("./auth/middleware");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/carts");
const orderRoutes = require("./routes/orders");
const errorHandler = require("./errors/errorHandler");
const { swaggerUi, specs } = require("./swagger/swaggerConfig");

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.post("/register", register);
app.post("/login", login);

app.use("/products", productRoutes);
app.use("/carts", cartRoutes);
app.use("/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/protected", authenticate, (req, res) => {
  res.send("This is a protected route");
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on Port ${port}`);
});
