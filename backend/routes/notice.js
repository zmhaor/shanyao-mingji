const express = require("express")
const router = express.Router()
const noticeController = require("../controllers/NoticeController")

// 小程序端获取当前活动公告
router.get("/active", noticeController.getActiveNotice)

// 确认公告 (计数自增)
router.post("/confirm/:id", noticeController.confirmNotice)

module.exports = router
