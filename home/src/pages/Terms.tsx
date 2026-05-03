import React from 'react';
import { motion } from 'motion/react';
import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Terms() {
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
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold serif text-warm-ink">用户服务协议</h1>
            <p className="text-warm-muted text-sm mt-1">版本：第 2 版 | 生效日期：2026 年 4 月 24 日</p>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        className="glass-strong rounded-3xl p-8 md:p-12 mb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <p className="text-warm-muted leading-relaxed mb-4">
          欢迎您使用"山药铭记"微信小程序。
        </p>
        <p className="text-warm-muted leading-relaxed mb-4">
          本协议是您与山药铭记开发者之间，就您访问、注册、登录和使用山药铭记微信小程序及相关服务所订立的协议。请您在使用前认真阅读并充分理解本协议内容，尤其是涉及免责、服务限制、知识产权、争议解决等条款。您勾选同意、授权登录、注册账号或继续使用本小程序的，即视为您已阅读、理解并同意接受本协议全部内容。
        </p>
        <p className="text-warm-muted leading-relaxed">
          如您未满 18 周岁，请在监护人陪同下阅读本协议，并在取得监护人同意后使用本小程序。
        </p>

        <h2 className="text-2xl font-semibold serif text-warm-ink mt-10 mb-4">一、服务说明</h2>
        <p className="text-warm-muted leading-relaxed">
          山药铭记是一款面向中医药学习者的学习辅助工具，当前主要提供以下服务：
        </p>
        <ul className="text-warm-muted leading-relaxed list-disc pl-6 space-y-1">
          <li>中医知识内容浏览、学习、记忆与复习功能；</li>
          <li>学习记录、本地进度及云端同步功能；</li>
          <li>收藏、历史记录、积分、邀请、资料下载、资料兑换等功能；</li>
          <li>用户反馈、公告通知、关于页面展示等辅助功能；</li>
          <li>我们基于当前产品形态提供的其他合法功能或服务。</li>
        </ul>
        <p className="text-warm-muted leading-relaxed">
          我们有权基于业务运营、功能调整、合规要求或平台规则变化，对服务内容进行更新、升级、限制、暂停或终止。若相关变化会对您的核心使用权益产生重大影响，我们将通过页面公告、站内提示等合理方式通知您。
        </p>

        <h2 className="text-2xl font-semibold serif text-warm-ink mt-10 mb-4">二、账号注册、登录与安全</h2>
        <p className="text-warm-muted leading-relaxed">
          您可通过微信授权登录等我们实际提供的方式使用本小程序。部分功能可能仅对已登录用户开放。
        </p>
        <p className="text-warm-muted leading-relaxed">
          您应保证所提供的注册、登录或资料信息真实、合法、有效，并及时更新。因信息不真实、不准确或未及时更新导致的损失，由您自行承担。
        </p>
        <p className="text-warm-muted leading-relaxed">
          您应妥善保管账号、登录状态和相关设备，不得出借、出租、出售、转让、许可他人使用您的账号，也不得以任何方式协助他人恶意注册、盗用账号或绕过身份验证。因您保管不善造成的损失或责任，由您自行承担。
        </p>
        <p className="text-warm-muted leading-relaxed">
          您申请注销账号后，我们将在核验身份并满足必要条件后处理注销事宜。账号注销后，与该账号相关的部分信息或数据可能无法恢复，法律法规另有规定或监管机关另有要求的除外。
        </p>

        <h2 className="text-2xl font-semibold serif text-warm-ink mt-10 mb-4">三、用户行为规范</h2>
        <p className="text-warm-muted leading-relaxed">
          您在使用本小程序过程中，应当遵守法律法规、微信平台规则及本协议约定，不得实施以下行为：
        </p>
        <ul className="text-warm-muted leading-relaxed list-disc pl-6 space-y-1">
          <li>发布、传播、存储违法违规、虚假、侮辱、诽谤、淫秽、暴力或侵犯他人合法权益的内容；</li>
          <li>冒用他人身份，或者以虚构事实、隐瞒真相等方式误导他人；</li>
          <li>利用程序、脚本、插件、接口调用、抓包、爬虫或其他技术手段批量抓取、复制、下载、导出本小程序内容或数据；</li>
          <li>对本小程序进行反向工程、反编译、反汇编、破解、干扰、攻击，或实施任何可能影响系统安全和稳定的行为；</li>
          <li>利用本小程序从事刷分、作弊、恶意邀请、薅取权益、倒卖资料或其他不正当使用行为；</li>
          <li>未经授权，将本小程序内容或服务用于商业宣传、商业培训、转售、再许可或其他商业用途；</li>
          <li>实施其他违反法律法规、平台规则、公序良俗或本协议目的的行为。</li>
        </ul>
        <p className="text-warm-muted leading-relaxed">
          如您违反前述约定，我们有权视情节采取删除内容、限制功能、暂停服务、终止账号、撤销兑换权益、追究法律责任等处理措施。
        </p>

        <h2 className="text-2xl font-semibold serif text-warm-ink mt-10 mb-4">四、内容说明与知识产权</h2>
        <p className="text-warm-muted leading-relaxed">
          本小程序中的功能界面、程序代码、页面设计、文案编排、图标、数据库整理成果及其他由我们依法享有权利的内容，相关知识产权归我们或相关权利人所有。未经书面许可，您不得以复制、传播、展示、信息网络传播、改编、汇编、镜像或其他方式使用。
        </p>
        <p className="text-warm-muted leading-relaxed">
          本小程序中的部分中医药知识、条文、方剂、教材摘录、资料整理内容可能来源于公开出版物、公开资料或依法可使用的信息资源，其著作权及其他权利归原作者或原权利人所有。我们基于学习辅助目的进行整理、摘录、展示，并不意味着您当然获得对相关内容的进一步传播或商业使用权。
        </p>
        <p className="text-warm-muted leading-relaxed">
          如果您认为本小程序中的相关内容侵犯了您的合法权益，请通过本协议载明的联系方式向我们提交权属证明、侵权说明及必要材料，我们将在收到后及时核查并依法处理。
        </p>
        <p className="text-warm-muted leading-relaxed">
          您通过本小程序提交的反馈、建议、评论等内容，应保证不侵犯任何第三方合法权益。对于您主动提交且用于产品改进的反馈内容，您同意授予我们在产品优化、问题排查、客服处理和运营分析范围内免费的、必要的使用权。
        </p>

        <h2 className="text-2xl font-semibold serif text-warm-ink mt-10 mb-4">五、积分、资料与其他权益规则</h2>
        <p className="text-warm-muted leading-relaxed">
          本小程序内展示的积分、邀请奖励、资料下载资格、兑换内容等，属于平台内功能安排或运营权益，不具有法定货币属性，不得提现，不得与现实货币直接等价兑换，除页面明确说明外也不得转让、出售或进行线下交易。
        </p>
        <p className="text-warm-muted leading-relaxed">
          积分获取、使用、失效、清零、调整方式及资料兑换规则，以届时页面展示、活动说明或具体功能提示为准。因系统异常、作弊、滥用规则、违规操作等原因导致权益发放错误的，我们有权进行更正、回收或限制使用。
        </p>
        <p className="text-warm-muted leading-relaxed">
          通过积分兑换或其他方式获取的资料、内容或下载权限，仅限您个人学习使用，不得擅自转载、传播、售卖、出租、共享账号或通过其他方式向第三方提供。
        </p>

        <h2 className="text-2xl font-semibold serif text-warm-ink mt-10 mb-4">六、个人信息与隐私保护</h2>
        <p className="text-warm-muted leading-relaxed">
          我们非常重视您的个人信息和隐私保护。关于我们如何收集、使用、存储、共享和保护您的个人信息，以及您如何行使相关权利，请详见
          <Link to="/privacy" className="text-olive hover:underline mx-1">《山药铭记 个人信息保护政策》</Link>。
          该政策是本协议的重要组成部分，与本协议具有同等法律效力。
        </p>

        <h2 className="text-2xl font-semibold serif text-warm-ink mt-10 mb-4">七、服务中断、变更与终止</h2>
        <p className="text-warm-muted leading-relaxed">
          鉴于互联网服务的特殊性，您理解并同意：我们可能因系统维护、版本升级、服务器故障、网络问题、微信平台接口变化、监管要求、不可抗力等原因，导致服务中断、延迟、异常或部分功能不可用。我们将尽合理努力减少由此带来的影响，但在法律允许范围内不就因此产生的间接损失、附带损失承担赔偿责任。
        </p>
        <p className="text-warm-muted leading-relaxed">
          若您长期未使用账号、违反本协议或相关规则，或发生影响系统安全与合规的情形，我们有权暂停或终止向您提供全部或部分服务。
        </p>

        <h2 className="text-2xl font-semibold serif text-warm-ink mt-10 mb-4">八、免责声明</h2>
        <p className="text-warm-muted leading-relaxed">
          本小程序所提供的中医药学习内容、资料整理和记忆工具，仅用于学习、记忆和知识参考，不构成任何医疗建议、诊断结论、治疗方案或执业意见。若您需要医疗、用药、诊疗等专业建议，请咨询具有相应资质的专业人士。
        </p>
        <p className="text-warm-muted leading-relaxed">
          我们会尽力保证内容和服务的准确性、及时性与稳定性，但不对以下情形作绝对保证：内容完全无误、服务绝不中断、数据绝不丢失、第三方平台接口持续可用、所有设备与系统环境均可兼容。您应自行判断和承担因使用相关内容所产生的风险。
        </p>
        <p className="text-warm-muted leading-relaxed">
          对于因您自身原因、第三方原因、通信线路故障、设备故障、病毒木马攻击、平台规则变化、不可抗力等造成的损失，我们将在法律允许范围内免责或减轻责任。
        </p>

        <h2 className="text-2xl font-semibold serif text-warm-ink mt-10 mb-4">九、协议更新</h2>
        <p className="text-warm-muted leading-relaxed">
          我们有权根据法律法规变化、业务发展、功能调整或平台规则更新，对本协议进行修订。更新后的协议将通过本小程序页面展示、公告或其他合理方式公布，并自公布之日起生效或按公告载明的时间生效。若您在协议更新后继续使用本小程序，即视为您接受更新后的协议内容。
        </p>

        <h2 className="text-2xl font-semibold serif text-warm-ink mt-10 mb-4">十、适用法律与争议解决</h2>
        <p className="text-warm-muted leading-relaxed">
          本协议的订立、生效、履行、解释及争议解决，均适用中华人民共和国法律（为本协议之目的，不含香港特别行政区、澳门特别行政区和台湾地区法律）。
        </p>
        <p className="text-warm-muted leading-relaxed">
          如因本协议或本小程序服务产生任何争议，双方应优先友好协商解决；协商不成的，任一方均可向开发者所在地有管辖权的人民法院提起诉讼。
        </p>

        <h2 className="text-2xl font-semibold serif text-warm-ink mt-10 mb-4">十一、联系我们</h2>
        <p className="text-warm-muted leading-relaxed">
          如您对本协议有任何疑问、建议，或需要进行知识产权投诉、账号注销、权利主张等，请通过以下方式联系我们：
        </p>
        <ul className="text-warm-muted leading-relaxed list-disc pl-6 space-y-1">
          <li><strong>电子邮箱：</strong>your-email@example.com</li>
          <li><strong>反馈入口：</strong>小程序"我的"页面内的用户反馈入口</li>
        </ul>
        <p className="text-warm-muted leading-relaxed">
          我们将在收到您的请求后，在合理期限内予以回复或处理。
        </p>
        <p className="text-warm-muted leading-relaxed text-sm mt-6">
          本协议标题仅为阅读方便而设，不影响条款含义解释。本协议各条款如部分无效或不可执行，不影响其余条款的效力。
        </p>
      </motion.div>
    </div>
  );
}
