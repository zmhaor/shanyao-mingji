const express = require("express")
const router = express.Router()
const noticeController = require("../../controllers/NoticeController")

// 管理端的 CRUD 路由
router.get("/list", noticeController.adminList)
router.post("/create", noticeController.adminCreate)
router.put("/update/:id", noticeController.adminUpdate)
router.delete("/delete/:id", noticeController.adminDelete)

module.exports = router
