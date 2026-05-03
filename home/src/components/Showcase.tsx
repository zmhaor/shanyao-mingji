import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Brain, FlaskConical, Leaf, Pill, ScrollText, ChevronRight, Sparkles, Eye, FileCheck } from 'lucide-react';

const tools = [
  {
    id: "shanghan",
    title: "伤寒速速通",
    subtitle: "条文抽查与体系巩固",
    desc: "针对《伤寒论》核心条文设计，提供诵读、抽查、检验三模式。帮助快速建立经方思维，深入理解精髓。",
    tags: ["原著诵读", "盲测抽查", "体系巩固"],
    icon: <ScrollText className="w-5 h-5" />,
    color: "from-amber-500 to-orange-600",
    lightColor: "bg-amber-500/10",
    imgPrimary: "/小程序图片/各工具页面展示/伤寒速速通 诵读页.jpg",
    imgSecondary: "/小程序图片/各工具页面展示/伤寒速速通 抽查页.jpg",
  },
  {
    id: "jingui",
    title: "金匮简易考",
    subtitle: "核心杂病知识点回顾",
    desc: "提炼《金匮要略》精华，通过碎片化测验和情景诵读，稳固杂病辨治体系。",
    tags: ["条文速记", "碎片考察", "杂病辨治"],
    icon: <BookOpen className="w-5 h-5" />,
    color: "from-emerald-500 to-teal-600",
    lightColor: "bg-emerald-500/10",
    imgPrimary: "/小程序图片/各工具页面展示/金匮简易考 诵读页.jpg",
    imgSecondary: "/小程序图片/各工具页面展示/金匮简易考 检查页.jpg",
  },
  {
    id: "wenbing",
    title: "温病掌上学",
    subtitle: "温病条辨沉浸式研习",
    desc: "完整收录《温病条辨》，针对卫气营血辨证与三焦辨证提供系统化学习方案。",
    tags: ["条辨原文", "系统研习", "辨证体系"],
    icon: <FlaskConical className="w-5 h-5" />,
    color: "from-blue-500 to-indigo-600",
    lightColor: "bg-blue-500/10",
    imgPrimary: "/小程序图片/各工具页面展示/温病掌上学 诵读页.jpg",
    imgSecondary: "/小程序图片/各工具页面展示/温病掌上学 抽查页.jpg",
  },
  {
    id: "zhongyao",
    title: "中药快快记",
    subtitle: "中医药性归经快速检验",
    desc: "汇集中药四气五味、升降浮沉等核心考点，多维度的记忆与抽查方式。",
    tags: ["性味归经", "四气五味", "药性记忆"],
    icon: <Leaf className="w-5 h-5" />,
    color: "from-green-500 to-emerald-600",
    lightColor: "bg-green-500/10",
    imgPrimary: "/小程序图片/各工具页面展示/中药快快记 诵读页.jpg",
    imgSecondary: "/小程序图片/各工具页面展示/中药快快记 抽查页.jpg",
  },
  {
    id: "fangji",
    title: "方剂轻松过",
    subtitle: "名方组成与主治高效背记",
    desc: "严选历代名老中医经典方剂，知识点模块化，随时随地抽查，巩固背诵记忆。",
    tags: ["君臣佐使", "趣味方歌", "方剂背记"],
    icon: <Pill className="w-5 h-5" />,
    color: "from-purple-500 to-violet-600",
    lightColor: "bg-purple-500/10",
    imgPrimary: "/小程序图片/各工具页面展示/方剂轻松过 诵读页.jpg",
    imgSecondary: "/小程序图片/各工具页面展示/方剂速速记 抽查页.jpg",
  },
  {
    id: "neijing",
    title: "内经随身背",
    subtitle: "黄帝内经核心段落测验",
    desc: "《素问》《灵枢》重点篇目全覆盖，通过定制化背诵计划与抽查强化记忆。",
    tags: ["素问灵枢", "中医本源", "经典背诵"],
    icon: <Brain className="w-5 h-5" />,
    color: "from-rose-500 to-pink-600",
    lightColor: "bg-rose-500/10",
    imgPrimary: "/小程序图片/各工具页面展示/内经随身背 诵读页.jpg",
    imgSecondary: "/小程序图片/各工具页面展示/内经随时背 抽查页.jpg",
  }
];

export function Showcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTool = tools[activeIndex];

  return (
    <section id="showcase" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern pointer-events-none"></div>
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-gradient-to-l from-olive/5 to-transparent rounded-full blur-[100px] pointer-events-none -translate-y-1/2"></div>

      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-16">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-white/40 text-xs font-semibold tracking-widest text-olive mb-5 uppercase"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            经典工具矩阵
          </motion.div>
          <h3 className="text-4xl md:text-5xl font-semibold serif text-warm-ink mb-5">六大专属记忆工具</h3>
          <p className="text-warm-muted text-lg leading-relaxed">覆盖中医经典全科，助力高效背诵</p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">

          {/* Left: Tool Navigation */}
          <motion.div
            className="lg:w-80 shrink-0"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="glass-strong rounded-3xl p-4 lg:p-5 sticky top-24">
              {/* Desktop Navigation */}
              <div className="hidden lg:flex flex-col gap-2">
                {tools.map((tool, idx) => (
                  <motion.button
                    key={tool.id}
                    onClick={() => setActiveIndex(idx)}
                    className={`relative flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 cursor-pointer text-left group ${
                      idx === activeIndex
                        ? 'bg-white shadow-lg shadow-black/[0.04]'
                        : 'hover:bg-white/60'
                    }`}
                    whileHover={{ x: idx === activeIndex ? 0 : 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Icon */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 bg-gradient-to-br ${tool.color} ${
                      idx === activeIndex ? 'shadow-lg scale-105' : 'opacity-70 group-hover:opacity-100'
                    }`}>
                      <span className="text-white">{tool.icon}</span>
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold transition-colors duration-300 ${
                        idx === activeIndex ? 'text-warm-ink' : 'text-warm-muted'
                      }`}>
                        {tool.title}
                      </div>
                      <div className={`text-xs mt-0.5 truncate transition-all duration-300 ${
                        idx === activeIndex ? 'text-olive' : 'text-warm-muted/60'
                      }`}>
                        {tool.subtitle}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className={`w-4 h-4 transition-all duration-300 ${
                      idx === activeIndex ? 'text-olive opacity-100' : 'text-warm-muted opacity-0 group-hover:opacity-50'
                    }`} />

                    {/* Active Indicator */}
                    {idx === activeIndex && (
                      <motion.div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-olive to-olive-light rounded-full"
                        layoutId="activeNav"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Mobile Navigation */}
              <div className="lg:hidden flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {tools.map((tool, idx) => (
                  <motion.button
                    key={tool.id}
                    onClick={() => setActiveIndex(idx)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-300 shrink-0 ${
                      idx === activeIndex
                        ? 'bg-white text-warm-ink shadow-md'
                        : 'text-warm-muted hover:bg-white/50'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className={idx === activeIndex ? 'text-olive' : ''}>{tool.icon}</span>
                    <span className="text-sm font-medium">{tool.title}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Content Display */}
          <motion.div
            className="flex-1 min-w-0"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTool.id}
                className="glass-strong rounded-[2rem] p-6 sm:p-8 lg:p-10 relative overflow-hidden"
                initial={{ opacity: 0, y: 15, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.99 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                {/* Background Glow */}
                <div className={`absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br ${activeTool.color} opacity-[0.06] blur-3xl rounded-full pointer-events-none`}></div>

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start gap-5 mb-8">
                    <motion.div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${activeTool.color} shadow-xl`}
                      initial={{ scale: 0.8, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <span className="text-white text-2xl">{activeTool.icon}</span>
                    </motion.div>
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-serif font-semibold text-warm-ink">
                        {activeTool.title}
                      </h4>
                      <p className="text-olive text-sm mt-1 font-medium">{activeTool.subtitle}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-warm-muted leading-relaxed mb-6 text-base sm:text-lg">
                    {activeTool.desc}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2.5 mb-8">
                    {activeTool.tags.map((tag, tIdx) => (
                      <motion.span
                        key={tIdx}
                        className="px-4 py-2 rounded-xl bg-white/70 text-warm-ink text-sm font-medium border border-white/60 shadow-sm hover:shadow-md hover:bg-white transition-all duration-200 cursor-default"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: tIdx * 0.08 }}
                        whileHover={{ y: -2 }}
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>

                  {/* Images */}
                  <div className="grid grid-cols-2 gap-4 sm:gap-6">
                    <motion.div
                      className="relative group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-olive/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative overflow-hidden rounded-2xl">
                        <img
                          src={activeTool.imgPrimary}
                          alt={`${activeTool.title} 诵读`}
                          className="w-full h-auto rounded-2xl shadow-xl ring-1 ring-black/5 transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="bg-black/50 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-lg text-center flex items-center justify-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" />
                          诵读模式
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="relative group"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-olive/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative overflow-hidden rounded-2xl">
                        <img
                          src={activeTool.imgSecondary}
                          alt={`${activeTool.title} 抽查`}
                          className="w-full h-auto rounded-2xl shadow-xl ring-1 ring-black/5 transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="bg-black/50 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-lg text-center flex items-center justify-center gap-1.5">
                          <FileCheck className="w-3.5 h-3.5" />
                          抽查模式
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Footer Indicator */}
                  <div className="mt-8 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-warm-muted">
                      <span className="text-olive font-serif text-2xl font-bold">{String(activeIndex + 1).padStart(2, '0')}</span>
                      <span className="w-10 h-px bg-gradient-to-r from-olive/40 to-transparent"></span>
                      <span className="text-sm">{String(tools.length).padStart(2, '0')}</span>
                    </div>

                    {/* Dots */}
                    <div className="flex gap-2">
                      {tools.map((_, idx) => (
                        <motion.button
                          key={idx}
                          onClick={() => setActiveIndex(idx)}
                          className={`transition-all duration-300 rounded-full ${
                            idx === activeIndex
                              ? 'w-8 h-2.5 bg-gradient-to-r from-olive to-olive-light'
                              : 'w-2.5 h-2.5 bg-warm-border hover:bg-warm-muted/40'
                          }`}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
