import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Heart, Star, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CTA() {
  const navigate = useNavigate();
  return (
    <section className="py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          className="relative glass-dark rounded-[2.5rem] p-12 md:p-16 lg:p-20 overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-white rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2"></div>
          </div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.04]">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M0 0h1v1H0zM20 0h1v1h-1zM0 20h1v1H0zM20 20h1v1h-1z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          {/* Floating Elements */}
          <motion.div
            className="absolute top-10 right-16 text-white/10"
            animate={{ y: [-5, 5, -5], rotate: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Star className="w-12 h-12" />
          </motion.div>
          <motion.div
            className="absolute bottom-12 left-20 text-white/10"
            animate={{ y: [5, -5, 5], rotate: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <Heart className="w-10 h-10" />
          </motion.div>
          <motion.div
            className="absolute top-1/2 right-10 text-white/5"
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          >
            <Zap className="w-16 h-16" />
          </motion.div>

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium mb-8 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-4 h-4" />
              <span>开启中医学习之旅</span>
            </motion.div>

            {/* Heading */}
            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              准备好成为<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60">更好的中医人</span>了吗？
            </motion.h2>

            {/* Description */}
            <motion.p
              className="text-lg text-white/70 leading-relaxed mb-10 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              加入 10,000+ 中医学子的行列，让山药铭记成为你最得力的学习助手。
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                className="group px-8 py-4 rounded-2xl bg-white text-olive font-semibold hover:bg-white/90 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center gap-3"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/download')}
              >
                <img src="https://api.iconify.design/mingcute:wechat-miniprogram-fill.svg?color=%236366F1" alt="Wechat" className="w-5 h-5" />
                <span>立即体验小程序</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                className="px-8 py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-all duration-300 flex items-center gap-2 backdrop-blur-sm"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span>了解更多功能</span>
              </motion.button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              className="mt-14 flex flex-wrap items-center justify-center gap-8 text-white/50 text-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              {[
                { icon: "check", text: "免费使用" },
                { icon: "check", text: "无需注册" },
                { icon: "check", text: "即开即用" },
                { icon: "check", text: "永久更新" },
              ].map((badge, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-center gap-2"
                  whileHover={{ color: "rgba(255,255,255,0.8)" }}
                >
                  <svg className="w-4 h-4 text-white/40" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{badge.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
