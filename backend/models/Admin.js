const bcrypt = require("bcryptjs")
const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Admin = sequelize.define("Admin", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    set(value) {
      // 密码加密
      const salt = bcrypt.genSaltSync(10)
      this.setDataValue("password", bcrypt.hashSync(value, salt))
    }
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: "admin"
  },
  create_time: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: () => Date.now()
  }
}, {
  tableName: "admins",
  timestamps: false
})

// 验证密码
Admin.prototype.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.password)
}

module.exports = Admin
