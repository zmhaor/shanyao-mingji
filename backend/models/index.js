const User = require("./User")
const Tool = require("./Tool")
const Favorite = require("./Favorite")
const History = require("./History")
const ShopItem = require("./ShopItem")
const UserExchange = require("./UserExchange")
const Admin = require("./Admin")
const Config = require("./Config")
const Category = require("./Category")
const StudyProgress = require("./StudyProgress")
const Comment = require("./Comment")
const CommentLike = require("./CommentLike")
const Feedback = require("./Feedback")
const FeedbackLike = require("./FeedbackLike")
const FeedbackReply = require("./FeedbackReply")
const Notice = require("./Notice")
const Material = require("./Material")
const MaterialExchange = require("./MaterialExchange")
const ContentCollection = require("./ContentCollection")
const ContentItem = require("./ContentItem")
const ContentDeleteLog = require("./ContentDeleteLog")
const SyncHistory = require("./SyncHistory")

User.hasMany(Favorite, { foreignKey: "user_id" })
User.hasMany(History, { foreignKey: "user_id" })
User.hasMany(UserExchange, { foreignKey: "user_id" })
User.hasMany(StudyProgress, { foreignKey: "user_id" })
User.hasMany(Comment, { foreignKey: "user_id" })
User.hasMany(CommentLike, { foreignKey: "user_id" })
User.hasMany(Feedback, { foreignKey: "user_id" })
User.hasMany(FeedbackLike, { foreignKey: "user_id" })
User.hasMany(FeedbackReply, { foreignKey: "user_id" })
User.hasMany(MaterialExchange, { foreignKey: "user_id" })
User.hasMany(SyncHistory, { foreignKey: "user_id" })
StudyProgress.belongsTo(User, { foreignKey: "user_id" })
SyncHistory.belongsTo(User, { foreignKey: "user_id" })

Tool.hasMany(Favorite, { foreignKey: "tool_id" })
Tool.hasMany(History, { foreignKey: "tool_id" })

Favorite.belongsTo(User, { foreignKey: "user_id" })
Favorite.belongsTo(Tool, { foreignKey: "tool_id" })

History.belongsTo(User, { foreignKey: "user_id" })
History.belongsTo(Tool, { foreignKey: "tool_id" })

UserExchange.belongsTo(User, { foreignKey: "user_id" })
UserExchange.belongsTo(ShopItem, { foreignKey: "item_id" })
MaterialExchange.belongsTo(User, { foreignKey: "user_id" })
MaterialExchange.belongsTo(Material, { foreignKey: "material_id" })
Material.hasMany(MaterialExchange, { foreignKey: "material_id" })

Comment.belongsTo(User, { foreignKey: "user_id" })
Comment.hasMany(Comment, { as: "replies", foreignKey: "parent_id", onDelete: "CASCADE", hooks: true })
Comment.belongsTo(Comment, { as: "parent", foreignKey: "parent_id" })
Comment.hasMany(CommentLike, { foreignKey: "comment_id", onDelete: "CASCADE", hooks: true })
CommentLike.belongsTo(Comment, { foreignKey: "comment_id" })
CommentLike.belongsTo(User, { foreignKey: "user_id" })

Feedback.belongsTo(User, { foreignKey: "user_id" })
Feedback.hasMany(FeedbackLike, { foreignKey: "feedback_id", onDelete: "CASCADE" })
Feedback.hasMany(FeedbackReply, { foreignKey: "feedback_id", onDelete: "CASCADE" })
FeedbackLike.belongsTo(Feedback, { foreignKey: "feedback_id" })
FeedbackLike.belongsTo(User, { foreignKey: "user_id" })
FeedbackReply.belongsTo(Feedback, { foreignKey: "feedback_id" })
FeedbackReply.belongsTo(User, { foreignKey: "user_id" })
FeedbackReply.belongsTo(Admin, { foreignKey: "admin_id" })

ContentCollection.hasMany(ContentItem, { foreignKey: "collection_id", onDelete: "CASCADE", hooks: true })
ContentItem.belongsTo(ContentCollection, { foreignKey: "collection_id" })
ContentCollection.hasMany(ContentDeleteLog, { foreignKey: "collection_id", onDelete: "CASCADE", hooks: true })
ContentDeleteLog.belongsTo(ContentCollection, { foreignKey: "collection_id" })

module.exports = {
  User,
  Tool,
  Favorite,
  History,
  ShopItem,
  UserExchange,
  Admin,
  Config,
  Category,
  StudyProgress,
  Comment,
  CommentLike,
  Feedback,
  FeedbackLike,
  FeedbackReply,
  Notice,
  Material,
  MaterialExchange,
  ContentCollection,
  ContentItem,
  ContentDeleteLog,
  SyncHistory
}
