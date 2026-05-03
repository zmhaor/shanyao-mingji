const bcrypt = require("bcryptjs")
const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const User = sequelize.define("User", {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false,
    defaultValue: () => `U${Date.now()}${Math.floor(Math.random() * 10000)}`
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  wechat_openid: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  nick_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true,
    set(value) {
      if (value) {
        // 密码加密
        const salt = bcrypt.genSaltSync(10)
        this.setDataValue("password", bcrypt.hashSync(value, salt))
      }
    }
  },
  avatar_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: ""
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  invite_code: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true
  },
  invited_by: {
    type: DataTypes.STRING(50),
    allowNull: true,
    references: {
      model: "users",
      key: "id"
    }
  },
  invite_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  invite_code_submitted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  create_time: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: () => Date.now()
  },
  update_time: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: () => Date.now(),
    onUpdate: () => Date.now()
  }
}, {
  tableName: "users",
  timestamps: false,
  hooks: {
    beforeCreate: (user) => {
      user.create_time = Date.now()
      user.update_time = Date.now()
      // 生成唯一邀请码
      if (!user.invite_code) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let code = ''
        for (let i = 0; i < 8; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        user.invite_code = code
      }
    },
    beforeUpdate: (user) => {
      user.update_time = Date.now()
    }
  }
})

// 验证密码
User.prototype.validatePassword = function (password) {
  if (!this.password) {
    return false
  }
  return bcrypt.compareSync(password, this.password)
}

module.exports = User
