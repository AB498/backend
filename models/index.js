const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "database.sqlite",
  logging: false,
});

let StringArrayType = (fieldName) => ({
  type: DataTypes.TEXT,
  defaultValue: "[]",
  get() {
    const vals = this.getDataValue(fieldName);
    return vals ? JSON.parse(vals) : [];
  },
  set(val) {
    this.setDataValue(fieldName, JSON.stringify(val));
  },
}); // for SQLite

const User = sequelize.define("User", {
  name: DataTypes.STRING,
  username: DataTypes.STRING,
  email: DataTypes.STRING,
  phone: DataTypes.STRING,
  password: DataTypes.STRING,
  avatar: DataTypes.STRING,
  dateOfBirth: DataTypes.DATE,
  bio: DataTypes.STRING,
  country: DataTypes.STRING,
  verificationStatus: { type: DataTypes.STRING, defaultValue: "pending" },
  jwts: StringArrayType("jwts"),
});
const Product = sequelize.define("Product", {
  name: DataTypes.STRING,
  price: DataTypes.NUMBER,
  description: DataTypes.STRING,
  category: StringArrayType("category"),
  images: StringArrayType("images"),
});
const Order = sequelize.define("Order", {
  name: DataTypes.STRING,
  user_id: DataTypes.NUMBER,
  product_ids: StringArrayType("product_ids"),
  status: { type: DataTypes.STRING, defaultValue: "pending" },
});

async function init() {
  [].forEach((model) => model.sync({ alter: true, force: true }));
  await sequelize.sync();
}

module.exports = { init, sequelize, User, Product, Order };
