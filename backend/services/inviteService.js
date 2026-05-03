const { Config, User } = require("../models")

const INVITE_VALID_DAYS = 3
const INVITE_VALID_MS = INVITE_VALID_DAYS * 24 * 60 * 60 * 1000

function normalizeInviteCode(inviteCode) {
  return String(inviteCode || "").trim().toUpperCase()
}

async function getInviteRewardConfig() {
  let inviteRewardPoints = 50
  let invitedUserRewardPoints = 100

  try {
    const [inviteRewardConfig, invitedUserRewardConfig] = await Promise.all([
      Config.findOne({ where: { key: "inviteRewardPoints" } }),
      Config.findOne({ where: { key: "invitedUserRewardPoints" } })
    ])

    if (inviteRewardConfig) {
      inviteRewardPoints = Number.parseInt(inviteRewardConfig.value, 10) || 50
    }

    if (invitedUserRewardConfig) {
      invitedUserRewardPoints = Number.parseInt(invitedUserRewardConfig.value, 10) || 100
    }
  } catch (error) {
    console.error("获取邀请奖励积分设置失败:", error)
  }

  return {
    inviteRewardPoints,
    invitedUserRewardPoints
  }
}

function isEligibleInviteUser(user) {
  const createTime = Number(user?.create_time) || 0
  if (!createTime) {
    return false
  }

  return Date.now() - createTime <= INVITE_VALID_MS
}

async function applyInviteCode(user, inviteCode) {
  const normalizedCode = normalizeInviteCode(inviteCode)

  if (!normalizedCode) {
    return { success: false, message: "邀请码不能为空" }
  }

  if (!user) {
    return { success: false, message: "用户不存在" }
  }

  if (user.invite_code_submitted || user.invited_by) {
    return { success: false, message: "您已完成推荐人绑定" }
  }

  if (!isEligibleInviteUser(user)) {
    return { success: false, message: "仅限注册3天内的新用户使用邀请码" }
  }

  if (normalizeInviteCode(user.invite_code) === normalizedCode) {
    return { success: false, message: "不能使用自己的邀请码" }
  }

  const inviter = await User.findOne({ where: { invite_code: normalizedCode } })
  if (!inviter) {
    return { success: false, message: "邀请码无效" }
  }

  if (inviter.id === user.id) {
    return { success: false, message: "不能使用自己的邀请码" }
  }

  const { inviteRewardPoints, invitedUserRewardPoints } = await getInviteRewardConfig()

  try {
    await User.sequelize.transaction(async (transaction) => {
      const [lockedInviter, lockedUser] = await Promise.all([
        User.findByPk(inviter.id, { transaction, lock: transaction.LOCK.UPDATE }),
        User.findByPk(user.id, { transaction, lock: transaction.LOCK.UPDATE })
      ])

      if (!lockedInviter || !lockedUser) {
        throw new Error("USER_NOT_FOUND")
      }

      if (lockedUser.invite_code_submitted || lockedUser.invited_by) {
        throw new Error("ALREADY_BOUND")
      }

      if (!isEligibleInviteUser(lockedUser)) {
        throw new Error("OUT_OF_WINDOW")
      }

      lockedInviter.invite_count = (Number(lockedInviter.invite_count) || 0) + 1
      lockedInviter.points = (Number(lockedInviter.points) || 0) + inviteRewardPoints
      await lockedInviter.save({ transaction })

      lockedUser.invited_by = lockedInviter.id
      lockedUser.invite_code_submitted = true
      lockedUser.points = (Number(lockedUser.points) || 0) + invitedUserRewardPoints
      await lockedUser.save({ transaction })

      inviter.invite_count = lockedInviter.invite_count
      inviter.points = lockedInviter.points
      user.invited_by = lockedUser.invited_by
      user.invite_code_submitted = lockedUser.invite_code_submitted
      user.points = lockedUser.points
    })
  } catch (error) {
    if (error.message === "ALREADY_BOUND") {
      return { success: false, message: "您已完成推荐人绑定" }
    }

    if (error.message === "OUT_OF_WINDOW") {
      return { success: false, message: "仅限注册3天内的新用户使用邀请码" }
    }

    console.error("处理邀请码失败:", error)
    return { success: false, message: "邀请码处理失败，请稍后重试" }
  }

  return {
    success: true,
    message: "邀请码提交成功",
    data: {
      inviteRewardPoints,
      invitedUserRewardPoints,
      inviterId: inviter.id
    }
  }
}

module.exports = {
  INVITE_VALID_DAYS,
  normalizeInviteCode,
  getInviteRewardConfig,
  isEligibleInviteUser,
  applyInviteCode
}
