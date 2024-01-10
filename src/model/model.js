const { sequelize } = require("../config/database_config");
const { DataTypes } = require("sequelize");
const { STRING, INTEGER, DATE, ENUM, UUID, UUIDV4, BOOLEAN } = DataTypes;
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = sequelize.define("User", {
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  firstName: {
    type: STRING,
    allowNull: false,
    validate: {
      isAlpha: {
        args: true,
        msg: "Invalid First Name!",
      },
    },
  },
  lastName: {
    type: STRING,
    allowNull: false,
    validate: {
      isAlpha: {
        args: true,
        msg: "Invalid Last Name!",
      },
    },
  },
  phone: {
    type: STRING,
    allowNull: true,
    unique: {
      args: true,
      msg: "Phone Number already in use!",
    },
    validate: {
      isNumeric: {
        args: true,
        msg: "Invalid Phone Number!",
      },
    },
  },
  email: {
    type: STRING,
    allowNull: false,
    unique: {
      args: true,
      msg: "Email Address already in use!",
    },
    validate: {
      isEmail: {
        args: true,
        msg: "Invalid Email Address!",
      },
    },
  },
  passwordHash: {
    type: STRING,
    allowNull: false,
  },
  transactionPin: {
    type: STRING,
    allowNull: true,
    validate: {
      len: {
        args: [4, 4],
        msg: "Invalid Transaction Pin",
      },
    },
  },
  avatar: {
    type: STRING,
    allowNull: true,
  },
  is2FAEnabled: {
    type: BOOLEAN,
    defaultValue: false,
  },
  role: {
    type: ENUM("ADMIN", "USER"),
    defaultValue: "USER",
  },
});

const Wallet = sequelize.define(
  "Wallet",
  {
    id: {
      type: UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    balance: {
      type: INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    userId: {
      type: UUID,
      allowNull: false,
    },
  },
  {
    updatedAt: "balanceUpdatedAt",
  }
);

const Transaction = sequelize.define("Transaction", {
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  amount: {
    type: INTEGER,
    allowNull: false,
  },
  type: {
    type: ENUM("QRCODE", "OTHER"),
    allowNull: false,
  },
  code: {
    type: STRING,
    allowNull: true,
  },
  status: {
    type: ENUM("PENDING", "COMPLETED", "CANCELLED"),
    defaultValue: "PENDING",
  },
  narration: {
    type: STRING,
    allowNull: false,
  },
  creditWalletId: {
    type: UUID,
    allowNull: false,
  },
  debitWalletId: {
    type: UUID,
    allowNull: true,
  },
});

Wallet.belongsTo(User, { foreignKey: "userId", onDelete: "cascade" });
Transaction.belongsTo(Wallet, {
  as: "creditWallet",
  foreignKey: "creditWalletId",
  onDelete: "cascade",
});
Transaction.belongsTo(Wallet, {
  as: "debitWallet",
  foreignKey: "debitWalletId",
  onDelete: "cascade",
});

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database Synced Successfully!");
  })
  .catch((error) => {
    console.log("Database Sync Failed", error);
  });

module.exports = { User, Wallet, Transaction };
