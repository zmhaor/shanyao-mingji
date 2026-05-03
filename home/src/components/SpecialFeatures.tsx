import React from 'react';
import { motion } from 'motion/react';
import { Users, Timer, Zap, Shield, Clock, Award, Sparkles, ArrowRight } from 'lucide-react';

export function SpecialFeatures() {
  return (
    <section id="special-features" className="py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-olive/5 to-purple-500/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-warm-accent/5 to-olive/5 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <motion.span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-olive/20 text-xs font-semibold tracking-widest text-olive uppercase mb-5"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            特色功能架构
          </motion.span>
          <h3 className="text-4xl md:text-5xl font-semibold serif text-warm-ink mb-5">沉浸互动，随叫随到</h3>
          <p className="text-warm-muted text-lg max-w-2xl mx-auto leading-relaxed">独创功能让学习更高效、更有趣</p>
        </motion.div>

        <div className="flex flex-col gap-12">
          {/* Feature 1: 随时背 */}
          <motion.div
            className="w-full glass-strong rounded-[2.5rem] relative overflow-hidden group"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-olive/10 to-purple-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none"></div>

            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative z-10 p-8 md:p-12 lg:p-16">
              {/* Text Content */}
              <div className="flex-1 w-full">
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-olive/10 text-olive text-sm font-medium mb-6"
                  whileHover={{ x: 4 }}
                >
                  <Timer className="w-4 h-4" />
                  <span>独创功能</span>
                </motion.div>

                <h4 className="text-3xl md:text-4xl font-serif font-semibold text-warm-ink mb-6 leading-tight">
                  独创<span className="gradient-text">"随时背"</span>系统
                </h4>

                <p className="text-lg text-warm-muted leading-relaxed mb-8 max-w-xl">
                  专为中医人设计的碎片化背诵模式。抛弃厚重的实体书，在通勤、排队的间隙，随时开启特定模块的打卡。纯净的界面设计与护眼排版，沉浸感十足。
                </p>

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-3 mb-10">
                  {[
                    { icon: <Zap className="w-4 h-4" />, text: "碎片化学习", desc: "5分钟高效利用" },
                    { icon: <Shield className="w-4 h-4" />, text: "护眼模式", desc: "长时间阅读不疲劳" },
                    { icon: <Clock className="w-4 h-4" />, text: "随时开启", desc: "无时间地点限制" },
                  ].map((tag, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/80 border border-warm-border text-sm font-medium text-warm-ink shadow-sm hover:shadow-md transition-all duration-200 cursor-default"
                      whileHover={{ y: -3, scale: 1.02 }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <span className="text-olive">{tag.icon}</span>
                      <div>
                        <div>{tag.text}</div>
                        <div className="text-xs text-warm-muted font-normal">{tag.desc}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { value: "5min", label: "碎片时间" },
                    { value: "6科", label: "覆盖科目" },
                    { value: "∞", label: "打卡次数" },
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      className="text-center lg:text-left"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                    >
                      <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
                      <div className="text-xs text-warm-muted mt-1">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div className="w-full lg:w-auto flex justify-center">
                <div className="relative">
                  {/* Decorative Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-olive/20 to-purple-500/20 rounded-[2.5rem] blur-2xl scale-95 opacity-60"></div>

                  <div className="relative flex items-center gap-5">
                    <motion.img
                      src="/小程序图片/随时背展示/随时背 选择科目页.jpg"
                      alt="随时背 科目页"
                      className="w-[200px] sm:w-[220px] rounded-2xl shadow-xl ring-1 ring-black/5 -rotate-3 hover:rotate-0 transition-transform duration-500"
                      whileHover={{ scale: 1.05, rotate: 0 }}
                    />
                    <motion.img
                      src="/小程序图片/随时背展示/随时背 学习页.jpg"
                      alt="随时背 学习页"
                      className="w-[220px] sm:w-[240px] rounded-2xl shadow-xl ring-1 ring-black/5 rotate-3 hover:rotate-0 transition-transform duration-500 -ml-6"
                      whileHover={{ scale: 1.05, rotate: 0 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature 2: 背诵组 */}
          <motion.div
            className="w-full glass-strong rounded-[2.5rem] relative overflow-hidden group"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {/* Background Decoration */}
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tl from-warm-accent/10 to-olive/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3 opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none"></div>

            <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16 relative z-10 p-8 md:p-12 lg:p-16">
              {/* Text Content */}
              <div className="flex-1 w-full">
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-warm-accent/10 text-warm-accent text-sm font-medium mb-6"
                  whileHover={{ x: 4 }}
                >
                  <Users className="w-4 h-4" />
                  <span>自定义分组</span>
                </motion.div>

                <h4 className="text-3xl md:text-4xl font-serif font-semibold text-warm-ink mb-6 leading-tight">
                  背诵组：<span className="gradient-text-warm">聚焦重点</span>内容
                </h4>

                <p className="text-lg text-warm-muted leading-relaxed mb-8 max-w-xl">
                  自由创建背诵组，将需要重点掌握的条文、方剂或中药归类整理。背诵时只显示组内内容，排除干扰，专注记忆核心知识点，让复习更高效。
                </p>

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-3 mb-10">
                  {[
                    { icon: <Users className="w-4 h-4" />, text: "自定义分组", desc: "灵活创建管理" },
                    { icon: <Award className="w-4 h-4" />, text: "聚焦重点", desc: "精准锁定核心" },
                    { icon: <Shield className="w-4 h-4" />, text: "纯净显示", desc: "排除干扰信息" },
                  ].map((tag, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/80 border border-warm-border text-sm font-medium text-warm-ink shadow-sm hover:shadow-md transition-all duration-200 cursor-default"
                      whileHover={{ y: -3, scale: 1.02 }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <span className="text-warm-accent">{tag.icon}</span>
                      <div>
                        <div>{tag.text}</div>
                        <div className="text-xs text-warm-muted font-normal">{tag.desc}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { value: "无限", label: "分组数量" },
                    { value: "自由", label: "内容组合" },
                    { value: "纯净", label: "专注显示" },
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      className="text-center lg:text-left"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                    >
                      <div className="text-2xl md:text-3xl font-bold gradient-text-warm">{stat.value}</div>
                      <div className="text-xs text-warm-muted mt-1">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Image */}
              <div className="w-full lg:w-auto flex justify-center">
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-warm-accent/20 to-olive/20 rounded-[2.5rem] blur-2xl scale-95 opacity-60"></div>
                  <img
                    src="/小程序图片/特色功能-背诵组功能.jpg"
                    alt="背诵组功能"
                    className="relative w-[260px] sm:w-[300px] rounded-[2.5rem] shadow-2xl ring-1 ring-black/5"
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Section Divider */}
        <div className="section-divider mt-20"></div>
      </div>
    </section>
  );
}
