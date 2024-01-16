const express = require("express");
const app = express();
const { readdirSync } = require("fs");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { sequelize } = require("./src/config/database_config");
const errorHandlerMiddleware = require("./src/middlewares/error_Handler");
const notFoundMiddleware = require("./src/middlewares/not_Found");
const authenticate = require("./src/middlewares/authenticate");
const swaggerUi = require("swagger-ui-express");
const swaggerOptions = require("./src/swagger");

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "src")));
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "https://fastqr.vercel.app",
    credentials: true,
  })
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerOptions));

readdirSync("./src/routes").map((routePath) => {
  if (routePath === "auth.route.js") {
    return app.use("/api/v1", require(`./src/routes/${routePath}`));
  }
  app.use("/api/v1", /* authenticate */ require(`./src/routes/${routePath}`));
});

app.get("/", (req, res) => {
  res.send("I AM WORKING BUT YOUVE GOTTA WORK TOO!");
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`FASTQR Server is running on PORT: ${PORT}.`);
  sequelize
    .authenticate()
    .then(() => {
      console.log("Database connected");
    })
    .catch((error) => {
      console.log("Error connecting to FASTQR Database", error);
    });
});
