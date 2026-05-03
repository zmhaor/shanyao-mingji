import React from 'react';
import { motion } from 'motion/react';
import { Heart, Leaf, Mail, MessageCircle, Shield, BookOpen, Users, Sparkles } from 'lucide-react';

const values = [
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "传承经典",
    desc: "致力于将中医经典以数字化方式呈现，让古籍学习更加便捷高效。",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "服务同仁",
    desc: "面向所有中医学习者，从入门到进阶，提供全方位的学习辅助工具。",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "品质保障",
    desc: "内容经过精心校对，繁体生僻字完美渲染，还原古籍原貌。",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "用心打磨",
    desc: "持续迭代优化，倾听用户反馈，不断完善每一个学习细节。",
  },
];

export function About() {
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
          <Leaf className="w-3.5 h-3.5" />
          关于我们
        </motion.span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold serif text-warm-ink mb-6">
          传承岐黄，<span className="gradient-text">铭记于心</span>
        </h1>
        <p className="text-lg text-warm-muted max-w-2xl mx-auto leading-relaxed">
          山药铭记是一款专注于中医经典学习与背诵的微信小程序，致力于让每一位中医人都能高效地内化岐黄精髓。
        </p>
      </motion.div>

      {/* Mission */}
      <motion.div
        className="glass-strong rounded-[2.5rem] p-8 md:p-12 lg:p-16 mb-20 relative overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-olive/10 to-purple-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-semibold serif text-warm-ink mb-6">我们的使命</h2>
          <p className="text-lg text-warm-muted leading-relaxed mb-6 max-w-3xl">
            中医经典浩如烟海，《伤寒论》《金匮要略》《温病条辨》《黄帝内经》等典籍是每一位中医人的必修课。然而，厚重的实体书和零散的学习方式往往让背诵变得枯燥低效。
          </p>
          <p className="text-lg text-warm-muted leading-relaxed max-w-3xl">
            山药铭记应运而生。我们将多部中医经典数字化整理，提供碎片化背诵、抽查检验、学习打卡等功能，让中医学习变得更高效、更有趣。无论是在通勤路上还是睡前时光，都能随时随地开启一段沉浸式的经典研习。
          </p>
        </div>
      </motion.div>

      {/* Values */}
      <motion.div
        className="mb-20"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl md:text-4xl font-semibold serif text-warm-ink text-center mb-12">核心理念</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, idx) => (
            <motion.div
              key={idx}
              className="glass rounded-3xl p-8 text-center card-hover group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-olive to-olive-light flex items-center justify-center text-white mb-5 mx-auto shadow-lg group-hover:scale-110 transition-transform">
                {value.icon}
              </div>
              <h3 className="text-xl font-semibold text-warm-ink mb-2">{value.title}</h3>
              <p className="text-warm-muted text-sm leading-relaxed">{value.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="glass-dark rounded-[2.5rem] p-8 md:p-12 mb-20 relative overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
        </div>
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "6", label: "经典工具" },
            { value: "4+", label: "中医典籍" },
            { value: "10000+", label: "学习用户" },
            { value: "24h", label: "随时可用" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + idx * 0.1 }}
            >
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Contact */}
      <motion.div
        className="text-center pb-8"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl md:text-4xl font-semibold serif text-warm-ink mb-6">联系我们</h2>
        <p className="text-warm-muted mb-8 max-w-xl mx-auto">
          如有任何疑问、建议或合作意向，欢迎通过以下方式联系我们
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="mailto:your-email@example.com"
            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl glass text-warm-ink font-medium hover:shadow-lg transition-all"
          >
            <Mail className="w-5 h-5 text-olive" />
            your-email@example.com
          </a>
          <a
            href="/feedback"
            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-olive to-olive-light text-white font-medium shadow-lg shadow-olive/20 hover:shadow-olive/40 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            提交反馈
          </a>
        </div>
      </motion.div>
    </div>
  );
}
