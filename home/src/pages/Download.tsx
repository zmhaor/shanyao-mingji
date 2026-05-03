import React from 'react';
import { motion } from 'motion/react';
import { Smartphone, Scan, BookOpen, Trophy, Sparkles, ChevronRight } from 'lucide-react';

const steps = [
  {
    icon: <Scan className="w-6 h-6" />,
    title: "扫码进入",
    desc: "微信扫一扫小程序码，即刻体验",
    number: "01",
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "选择科目",
    desc: "从六大经典工具中选择学习方向",
    number: "02",
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: "开始背诵",
    desc: "随时随地，高效记忆中医经典",
    number: "03",
  },
];

const faqs = [
  { q: "山药铭记是免费的吗？", a: "是的，核心功能完全免费，无需付费即可使用所有背诵工具。" },
  { q: "需要注册账号吗？", a: "无需单独注册，支持微信一键登录，也可以使用邮箱账号登录。" },
  { q: "支持哪些中医经典？", a: "目前支持《伤寒论》《金匮要略》《温病条辨》《黄帝内经》以及方剂库和中药库。" },
  { q: "学习记录会丢失吗？", a: "支持云端同步功能，登录后可跨设备同步学习进度，数据安全有保障。" },
];

export function Download() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12">
      {/* Hero */}
      <motion.div
        className="text-center py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.span
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-olive/20 text-xs font-semibold tracking-widest text-olive uppercase mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Smartphone className="w-3.5 h-3.5" />
          立即体验
        </motion.span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold serif text-warm-ink mb-6">
          微信扫码，<span className="gradient-text">即刻开始</span>
        </h1>
        <p className="text-lg text-warm-muted max-w-2xl mx-auto leading-relaxed">
          长按或扫描下方小程序码，无需下载安装，即开即用
        </p>
      </motion.div>

      {/* QR Code Card */}
      <motion.div
        className="flex justify-center mb-20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="glass-strong rounded-[2.5rem] p-8 md:p-12 text-center max-w-md w-full">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-olive/20 to-purple-500/20 rounded-[2rem] blur-2xl scale-95"></div>
            <img
              src="/小程序图片/首页+个人主页/首页.jpg"
              alt="山药铭记小程序"
              className="relative w-[240px] h-[240px] rounded-[2rem] shadow-2xl ring-1 ring-black/5 object-cover mx-auto"
            />
          </div>
          <p className="text-warm-muted text-sm mb-4">使用微信「扫一扫」或长按识别</p>
          <div className="flex items-center justify-center gap-2 text-olive font-medium text-sm">
            <Sparkles className="w-4 h-4" />
            <span>免费使用 · 无需注册 · 即开即用</span>
          </div>
        </div>
      </motion.div>

      {/* Steps */}
      <motion.div
        className="mb-20"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl md:text-4xl font-semibold serif text-warm-ink text-center mb-12">
          三步开始学习
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              className="glass rounded-3xl p-8 text-center card-hover relative overflow-hidden group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
            >
              <div className="absolute top-4 right-4 text-5xl font-black text-warm-ink/[0.03] group-hover:text-olive/[0.06] transition-colors">
                {step.number}
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-olive to-olive-light flex items-center justify-center text-white mb-5 mx-auto shadow-lg group-hover:scale-110 transition-transform">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold text-warm-ink mb-2">{step.title}</h3>
              <p className="text-warm-muted text-sm">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* FAQ */}
      <motion.div
        className="mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl md:text-4xl font-semibold serif text-warm-ink text-center mb-12">
          常见问题
        </h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              className="glass rounded-2xl p-6 group card-hover"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-olive/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-olive text-sm font-bold">Q</span>
                </div>
                <div>
                  <h4 className="font-semibold text-warm-ink mb-1">{faq.q}</h4>
                  <p className="text-warm-muted text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        className="text-center pb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-warm-muted mb-4">还有疑问？</p>
        <a
          href="/feedback"
          className="inline-flex items-center gap-2 text-olive font-medium hover:underline"
        >
          提交意见反馈 <ChevronRight className="w-4 h-4" />
        </a>
      </motion.div>
    </div>
  );
}
