import React from 'react';
import { motion } from 'motion/react';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-6 md:px-12">
      {/* Header */}
      <motion.div
        className="py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link to="/" className="inline-flex items-center gap-2 text-warm-muted hover:text-olive transition-colors mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-olive to-olive-light flex items-center justify-center text-white shadow-lg">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold serif text-warm-ink">个人信息保护政策</h1>
            <p className="text-warm-muted text-sm mt-1">版本：第 2 版 | 生效日期：2026 年 4 月 24 日</p>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        className="glass-strong rounded-3xl p-8 md:p-12 mb-12 prose prose-warm max-w-none"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <p className="text-warm-muted leading-relaxed">
          山药铭记开发者（以下简称"我们"）深知个人信息对您的重要性，并会尽力采取安全保护措施保护您的个人信息安全可控。本政策适用于您通过微信小程序"山药铭记"使用我们的产品和服务时，我们对您的个人信息进行收集、使用、存储、共享、转让、公开披露及保护的处理规则。
        </p>
        <p className="text-warm-muted leading-relaxed">
          请您在使用本小程序前仔细阅读并充分理解本政策，尤其关注加粗内容。您开始使用本小程序或继续使用相关服务的，即表示您已理解并同意本政策。
        </p>

        <h2 className="text-2xl font-semibold serif text-warm-ink mt-10 mb-4">一、我们如何收集和使用您的个人信息</h2>
        <p className="text-warm-muted leading-relaxed">
          我们遵循合法、正当、必要和诚信原则，仅在实现产品功能所必需的范围内处理您的个人信息。不同功能场景下，我们可能收集和使用的信息包括：
        </p>

        <h3 className="text-xl font-semibold text-warm-ink mt-6 mb-3">（一）账号登录与身份识别</h3>
        <p className="text-warm-muted leading-relaxed">
          当您使用微信授权登录时，我们会获取微信平台返回的必要身份标识信息，例如 OpenID，以及您授权提供的昵称、头像等资料，用于创建或识别您的账号、展示您的个人资料、维持登录状态和保障账号安全。
        </p>
        <p className="text-warm-muted leading-relaxed">
          当您使用邮箱等其他方式登录、找回账号或按页面提示补充账号资料时，我们会处理您主动提交的邮箱地址、密码或其他必要资料，用于身份验证、账号管理和安全校验。
        </p>

        <h3 className="text-xl font-semibold text-warm-ink mt-6 mb-3">（二）个人资料展示与编辑</h3>
        <p className="text-warm-muted leading-relaxed">
          当您修改昵称、头像或上传自定义头像时，我们会处理您主动提交的资料内容和图片文件，用于在小程序内展示您的账号信息、同步个人资料以及完成页面交互。
        </p>

        <h3 className="text-xl font-semibold text-warm-ink mt-6 mb-3">（三）学习、收藏、历史与云同步</h3>
        <p className="text-warm-muted leading-relaxed">
          当您使用学习工具、收藏、历史记录、复习进度和数据同步功能时，我们会处理您在使用过程中形成的学习记录、复习记录、记忆打点、隐藏设置、收藏记录、历史记录、同步时间及相关服务数据，用于实现学习进度保存、跨设备同步、内容展示、统计分析和异常恢复。
        </p>

        <h3 className="text-xl font-semibold text-warm-ink mt-6 mb-3">（四）积分、邀请、资料兑换与下载</h3>
        <p className="text-warm-muted leading-relaxed">
          当您参与积分、邀请、资料兑换或下载相关功能时，我们会处理您的积分余额、积分变动记录、邀请关系、邀请码使用情况、兑换记录、下载权限及相关操作记录，用于完成权益发放、资格核验、记录查询、异常处理和防范作弊。
        </p>

        <h3 className="text-xl font-semibold text-warm-ink mt-6 mb-3">（五）用户反馈与客服沟通</h3>
        <p className="text-warm-muted leading-relaxed">
          当您提交用户反馈、查看反馈处理进度或与管理员沟通时，我们会处理您主动填写的反馈内容、联系方式、是否匿名标记、回复记录、点赞状态及相关时间信息，用于问题排查、客服答复、产品优化和用户支持。
        </p>

        <h3 className="text-xl font-semibold text-warm-ink mt-6 mb-3">（六）保障服务安全与稳定运行</h3>
        <p className="text-warm-muted leading-relaxed">
          为维护系统安全、识别异常状态、提升服务稳定性，我们会处理必要的日志信息、请求记录、接口访问状态、设备环境信息、系统版本信息和操作时间等技术信息。这些信息主要用于故障排查、安全审计、风险控制和性能优化。
        </p>

        <h3 className="text-xl font-semibold text-warm-ink mt-6 mb-3">（七）公告、通知与配置展示</h3>
        <p className="text-warm-muted leading-relaxed">
          当您查看公告、关于页面或配置内容时，我们可能处理您对相关页面的访问记录、公告确认状态等信息，用于展示与您有关的通知内容及优化使用体验。
        </p>

        <h3 className="text-xl font-semibold text-warm-ink mt-6 mb-3">（八）我们不会因当前业务需要而主动收集的常见信息</h3>
        <ul className="text-warm-muted leading-relaxed list-disc pl-6 space-y-1">
          <li>您的精确地理位置；</li>
          <li>您的通讯录、通话记录、短信内容；</li>
          <li>您的指纹、人脸等生物识别信息；</li>
          <li>您设备中的非必要相册、麦克风、摄像头内容（除非未来某项功能明确需要并另行征得授权）。</li>
        </ul>
        <p className="text-warm-muted leading-relaxed">
          如未来产品功能升级确需处理超出本政策所述范围的个人信息，我们会另行向您告知并取得相应授权同意。
        </p>

        <h2 className="text-2xl font-semibold serif text-warm-ink mt-10 mb-4">二、我们如何使用 Cookie、同类技术与日志信息</h2>
        <p className="text-warm-muted leading-relaxed">
          鉴于微信小程序的运行机制，我们可能使用登录态缓存、本地存储、接口令牌、日志记录等同类技术，用于识别您的登录状态、保存必要设置、提升访问效率、保障服务安全和定位故障。您理解，这些技术多数属于实现服务所必需。
        </p>

        <h2 className="text-2xl font-semibold serif text-warm-ink mt-10 mb-4">三、我们如何存储和保护您的个人信息</h2>
        <h3 className="text-xl font-semibold text-warm-ink mt-6 mb-3">（一）存储地点</h3>
        <p className="text-warm-muted leading-relaxed">
          原则上，我们在中华人民共和国境内存储您使用本小程序过程中产生的个人信息。
        </p>
        <h3 className="text-xl font-semibold text-warm-ink mt-6 mb-3">（二）存储期限</h3>
        <p className="text-warm-muted leading-relaxed">
          我们仅在实现处理目的所必需的最短期限内保存您的个人信息；超出必要期限后，我们将依据法律法规要求进行删除或匿名化处理。您注销账号后，我们会在合理期限内删除或匿名化处理与该账号相关的个人信息，但法律法规另有规定、监管要求或为解决争议所必需的除外。
        </p>
        <h3 className="text-xl font-semibold text-warm-ink mt-6 mb-3">（三）安全保障措施</h3>
        <ul className="text-warm-muted leading-relaxed list-disc pl-6 space-y-1">
          <li>通过访问控制、身份认证、权限隔离等措施限制信息访问范围；</li>
          <li>在传输和存储过程中采取合理的安全技术措施保护数据；</li>
          <li>对重要操作保留必要日志，以便审计和异常排查；</li>
          <li>在发生或可能发生个人信息安全事件时，依法及时采取补救措施，并按要求向您告知。</li>
        </ul>
        <p className="text-warm-muted leading-relaxed">
          互联网环境并非百分之百安全，我们将尽最大合理努力保护您的个人信息安全，也请您妥善保管账号、设备和验证码等信息。
        </p>

        <h2 className="text-2xl font-semibold serif text-warm-ink mt-10 mb-4">四、我们如何共享、转让、公开披露您的个人信息</h2>
        <h3 className="text-xl font-semibold text-warm-ink mt-6 mb-3">（一）共享</h3>
        <p className="text-warm-muted leading-relaxed">
          除以下情形外，我们不会向第三方共享您的个人信息：在获取您单独同意或授权的情况下；为实现登录、基础运行或平台能力接入，需要向微信平台等提供服务所必需的合作方处理必要信息；在法律法规要求、诉讼争议解决、行政执法或司法机关依法要求的情况下；为维护我们、您或其他用户的人身财产安全及其他重大合法权益所必需且难以取得本人同意的情况下。
        </p>
        <h3 className="text-xl font-semibold text-warm-ink mt-6 mb-3">（二）转让</h3>
        <p className="text-warm-muted leading-relaxed">
          原则上我们不会将您的个人信息转让给任何公司、组织或个人；如因合并、分立、资产转让或其他类似交易确需转让，我们会要求接收方继续受本政策约束，否则将重新征求您的授权同意。
        </p>
        <h3 className="text-xl font-semibold text-warm-ink mt-6 mb-3">（三）公开披露</h3>
        <p className="text-warm-muted leading-relaxed">
          我们原则上不会公开披露您的个人信息；如确需公开披露，我们会向您告知目的、类型和可能涉及的敏感信息，并依法取得相应同意或基于法律法规要求进行。
        </p>
        <h3 className="text-xl font-semibold text-warm-ink mt-6 mb-3">（四）第三方 SDK 与平台能力</h3>
        <p className="text-warm-muted leading-relaxed">
          当前版本主要依赖微信小程序及微信开放平台提供的基础能力完成登录、页面运行和平台交互。关于微信平台如何处理您的个人信息，请以微信平台公布的相关规则和隐私政策为准。
        </p>

        <h2 className="text-2xl font-semibold serif text-warm-ink mt-10 mb-4">五、您如何管理您的个人信息</h2>
        <p className="text-warm-muted leading-relaxed">
          您可以通过小程序页面或联系我们的方式，对您的个人信息行使相关权利，包括：
        </p>
        <div className="overflow-x-auto my-4">
          <table className="w-full text-sm text-warm-muted border-collapse">
            <thead>
              <tr className="border-b border-warm-border">
                <th className="text-left py-3 px-4 font-semibold text-warm-ink">权利类型</th>
                <th className="text-left py-3 px-4 font-semibold text-warm-ink">常见方式</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-warm-border/50"><td className="py-3 px-4">查看和访问</td><td className="py-3 px-4">在"我的"等页面查看您的昵称、头像、积分、反馈记录等信息</td></tr>
              <tr className="border-b border-warm-border/50"><td className="py-3 px-4">更正和补充</td><td className="py-3 px-4">通过页面修改头像、昵称等资料，或联系客服协助处理</td></tr>
              <tr className="border-b border-warm-border/50"><td className="py-3 px-4">删除部分数据</td><td className="py-3 px-4">通过业务页面清理学习记录、重置功能，或联系开发者申请处理</td></tr>
              <tr className="border-b border-warm-border/50"><td className="py-3 px-4">撤回同意</td><td className="py-3 px-4">停止使用相关功能、取消授权或注销账号</td></tr>
              <tr className="border-b border-warm-border/50"><td className="py-3 px-4">注销账号</td><td className="py-3 px-4">通过本政策载明的联系方式提交注销申请</td></tr>
              <tr><td className="py-3 px-4">获取说明</td><td className="py-3 px-4">就个人信息处理规则、共享情况、保护措施等向我们咨询</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-2xl font-semibold serif text-warm-ink mt-10 mb-4">六、未成年人个人信息保护</h2>
        <p className="text-warm-muted leading-relaxed">
          我们高度重视未成年人的个人信息保护。如您是不满 14 周岁的未成年人，请在监护人陪同下阅读本政策，并在取得监护人同意后使用本小程序及提交个人信息。监护人应正确履行监护职责，保护未成年人个人信息安全。
        </p>
        <p className="text-warm-muted leading-relaxed">
          如我们发现存在未取得监护人同意而处理未成年人个人信息的情形，我们将尽快采取删除、停止处理等措施。
        </p>

        <h2 className="text-2xl font-semibold serif text-warm-ink mt-10 mb-4">七、本政策如何更新</h2>
        <p className="text-warm-muted leading-relaxed">
          我们可能根据法律法规变化、产品功能调整或运营需要，适时修订本政策。更新后的政策会通过小程序页面、公告或其他合理方式向您展示。若更新内容会对您的权利义务产生重大影响，我们会采取更显著的提示方式。新政策自公布之日起生效或按公告载明时间生效。
        </p>

        <h2 className="text-2xl font-semibold serif text-warm-ink mt-10 mb-4">八、如何联系我们</h2>
        <p className="text-warm-muted leading-relaxed">
          如果您对本政策有任何疑问、意见、建议，或需要投诉举报、行使个人信息权利，请通过以下方式联系我们：
        </p>
        <ul className="text-warm-muted leading-relaxed list-disc pl-6 space-y-1">
          <li><strong>电子邮箱：</strong>your-email@example.com</li>
          <li><strong>反馈入口：</strong>小程序"我的"页面内的用户反馈入口</li>
        </ul>
        <p className="text-warm-muted leading-relaxed">
          我们将在收到您的请求并完成必要身份核验后，于合理期限内进行答复或处理。
        </p>
      </motion.div>
    </div>
  );
}
