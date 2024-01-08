const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FASTQR API",
      version: "1.0.0",
      description: "API documentation for FASTQR application",
    },
    servers: [
      {
        url: "https://fastqr-usiv.onrender.com",
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
