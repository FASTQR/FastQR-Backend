const { sequelize } = require("../config/database_config");
const { DataTypes } = require("sequelize");
const { STRING, INTEGER, ENUM, UUID, UUIDV4, BOOLEAN } = DataTypes;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = sequelize.define(
  "User",
  {
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
    },
    avatar: {
      type: STRING,
    },
    is2FAEnabled: {
      type: BOOLEAN,
      defaultValue: false,
    },
    country: {
      type: STRING,
      allowNull: false,
    },
    countryCode: {
      type: STRING,
      allowNull: false,
    },
    isVerified: {
      type: BOOLEAN,
      defaultValue: false,
    },
    role: {
      type: ENUM("ADMIN", "USER"),
      defaultValue: "USER",
    },
  },
  {
    hooks: {
      beforeCreate: async (user) => {
        user.firstName = user.firstName.toLowerCase();
        user.lastName = user.lastName.toLowerCase();
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
        if (user.transactionPin) {
          user.transactionPin = await bcrypt.hash(user.transactionPin, salt);
        }
      },
      beforeUpdate: async (user) => {
        user.firstName = user.firstName.toLowerCase();
        user.lastName = user.lastName.toLowerCase();
        if (user.changed("passwordHash")) {
          const salt = await bcrypt.genSalt(10);
          user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
        }
        if (user.changed("transactionPin")) {
          const salt = await bcrypt.genSalt(10);
          user.transactionPin = await bcrypt.hash(user.transactionPin, salt);
        }
      },
    },
  }
);

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
    defaultValue: "QRCODE",
  },
  code: {
    type: STRING,
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
    allowNull: true,
  },
  debitWalletId: {
    type: UUID,
    allowNull: true,
  },
});

const OTP = sequelize.define("OTP", {
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: UUID,
    allowNull: false,
  },
  otp: {
    type: INTEGER,
    allowNull: false,
  },
});

User.prototype.createJWT = function () {
  return jwt.sign({ userId: this.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

User.prototype.comparePassword = async function (password) {
  const isMatch = await bcrypt.compare(password, this.passwordHash);
  return isMatch;
};

User.prototype.compareTransactionPin = async function (transactionPin) {
  const isMatch = await bcrypt.compare(transactionPin, this.transactionPin);
  return isMatch;
};

User.hasOne(Wallet, { foreignKey: "userId" });
Wallet.belongsTo(User, { foreignKey: "userId" });
Transaction.belongsTo(Wallet, {
  as: "creditWallet",
  foreignKey: "creditWalletId",
});
Transaction.belongsTo(Wallet, {
  as: "debitWallet",
  foreignKey: "debitWalletId",
});
User.hasOne(OTP, { foreignKey: "userId" });
OTP.belongsTo(User, { foreignKey: "userId" });

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database Synced Successfully!");
  })
  .catch((error) => {
    console.log("Database Sync Failed", error);
  });

module.exports = { User, Wallet, Transaction, OTP };
