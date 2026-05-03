import React from 'react';
import { motion } from 'motion/react';
import { MessageCircleHeart, BookOpen, Trophy, Compass, ArrowUpRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "古籍原貌呈现",
    description: "繁体生僻字完美渲染，划线折叠区域适配复杂层级，让经典回归原貌。",
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-500/5 to-cyan-500/5",
    hoverBg: "group-hover:from-blue-500/10 group-hover:to-cyan-500/10",
    number: "01",
  },
  {
    icon: <Compass className="w-6 h-6" />,
    title: "多级分类索引",
    description: "独创学习模式，区分必读与选读条文，为您规划最高效的中医进阶之路。",
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-500/5 to-pink-500/5",
    hoverBg: "group-hover:from-purple-500/10 group-hover:to-pink-500/10",
    number: "02",
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: "学习打卡与商城",
    description: "通过学习、签到积攒积分，在积分商城兑换绝版周边或高级资料，让坚持不再枯燥。",
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-500/5 to-orange-500/5",
    hoverBg: "group-hover:from-amber-500/10 group-hover:to-orange-500/10",
    number: "03",
  },
  {
    icon: <MessageCircleHeart className="w-6 h-6" />,
    title: "同道交流与反馈",
    description: "遇到古籍疑难与错别字？通过反馈专区提交，与天下中医同仁一起勘误经典，交流切磋。",
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-500/5 to-teal-500/5",
    hoverBg: "group-hover:from-emerald-500/10 group-hover:to-teal-500/10",
    number: "04",
  }
];

export function Features() {
  return (
    <section id="features" className="py-28 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-olive/5 to-transparent rounded-full blur-[100px] pointer-events-none"></div>

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
            四大核心设计
          </motion.span>
          <h3 className="text-4xl md:text-5xl font-semibold serif text-warm-ink mb-5">厚积薄发，专注中医</h3>
          <p className="text-warm-muted text-lg max-w-2xl mx-auto leading-relaxed">每一个细节，都为中医人的学习体验而生</p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              className="group relative glass rounded-3xl p-8 hover:bg-white transition-all duration-500 cursor-pointer card-hover overflow-hidden"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} ${feature.hoverBg} rounded-3xl transition-all duration-500`}></div>

              {/* Number */}
              <div className="absolute top-6 right-6 text-6xl font-black text-warm-ink/[0.03] group-hover:text-olive/[0.06] transition-colors duration-500 select-none">
                {feature.number}
              </div>

              {/* Icon */}
              <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-500`}>
                {feature.icon}
              </div>

              {/* Content */}
              <h4 className="relative text-xl font-semibold text-warm-ink mb-3 group-hover:text-warm-ink transition-colors">
                {feature.title}
              </h4>
              <p className="relative text-warm-muted leading-relaxed text-sm">
                {feature.description}
              </p>

              {/* Arrow */}
              <Link to="/download" className="relative mt-6 flex items-center gap-2 text-olive opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-3 group-hover:translate-y-0">
                <span className="text-sm font-medium">了解更多</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>

              {/* Bottom Accent Line */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-3xl`}></div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Decorative Line */}
        <div className="section-divider mt-20"></div>
      </div>
    </section>
  );
}
