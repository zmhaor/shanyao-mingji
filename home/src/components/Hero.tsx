import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { ArrowRight, Sparkles, BookOpen, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AnimatedCounter({ target, suffix = "", duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function Particles() {
  return (
    <div className="particle-field">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${8 + Math.random() * 12}s`,
            animationDelay: `${Math.random() * 10}s`,
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            opacity: 0.15 + Math.random() * 0.2,
          }}
        />
      ))}
    </div>
  );
}

export function Hero() {
  const navigate = useNavigate();
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const } }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-olive/8 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-warm-accent/6 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-blue-400/5 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 grid-pattern opacity-50 pointer-events-none"></div>

      {/* Particles */}
      <Particles />

      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
          {/* Left Content */}
          <motion.div
            className="max-w-2xl"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {/* Badge */}
            <motion.div variants={item} className="mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-olive/20 text-sm font-medium text-olive shadow-sm">
                <Sparkles className="w-4 h-4" />
                专注于中医经典的数字研习空间
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1 variants={item} className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.08]">
              <span className="text-warm-ink">随时随地，</span>
              <br />
              <span className="gradient-text">山药铭记</span>
              <motion.span
                className="text-warm-ink inline-block"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >。</motion.span>
            </motion.h1>

            {/* Description */}
            <motion.p variants={item} className="text-lg md:text-xl text-warm-muted leading-relaxed mb-10 text-balance max-w-xl">
              专为中医人打造的数字经典词典与背诵工具。沉浸式体验，助你高效内化岐黄精髓。
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={item} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <motion.button
                className="btn-primary group px-8 py-4 rounded-2xl bg-gradient-to-r from-olive to-olive-light hover:from-olive-light hover:to-olive transition-all duration-300 flex items-center gap-3 font-medium text-white shadow-xl shadow-olive/25 hover:shadow-olive/40"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/download')}
              >
                <img src="https://api.iconify.design/mingcute:wechat-miniprogram-fill.svg?color=white" alt="Wechat" className="w-5 h-5" />
                <span>开启背诵之旅</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <div className="flex items-center gap-4 glass px-6 py-3 rounded-2xl shadow-sm">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-white overflow-hidden shadow-sm">
                      <img src={`https://i.pravatar.cc/100?img=${i + 15}`} alt="User" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-warm-ink">
                    <AnimatedCounter target={10000} suffix="+" /> 学子
                  </p>
                  <p className="text-xs text-warm-muted">已加入背诵行列</p>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div variants={item} className="mt-14 grid grid-cols-3 gap-6">
              {[
                { value: "6", suffix: "大", label: "经典工具", icon: <BookOpen className="w-4 h-4" /> },
                { value: "100", suffix: "%", label: "原貌呈现", icon: <Sparkles className="w-4 h-4" /> },
                { value: "24", suffix: "h", label: "随时背诵", icon: <Clock className="w-4 h-4" /> },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  className="text-center sm:text-left group"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                    <span className="text-olive/60 group-hover:text-olive transition-colors">{stat.icon}</span>
                    <div className="text-2xl md:text-3xl font-bold text-warm-ink">
                      <AnimatedCounter target={parseInt(stat.value)} suffix={stat.suffix} />
                    </div>
                  </div>
                  <div className="text-sm text-warm-muted">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Phone Mockup */}
          <motion.div
            className="relative flex justify-center items-center mt-8 lg:mt-0"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[450px] h-[450px] bg-gradient-to-tr from-olive/25 via-purple-500/15 to-warm-accent/25 rounded-full blur-[100px]"></div>
            </div>

            {/* Decorative Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[350px] h-[350px] border border-olive/10 rounded-full absolute animate-[spin_40s_linear_infinite]"></div>
              <div className="w-[450px] h-[450px] border border-olive/5 rounded-full absolute animate-[spin_60s_linear_infinite_reverse]"></div>
              <div className="w-[280px] h-[280px] border border-dashed border-warm-accent/10 rounded-full absolute animate-[spin_30s_linear_infinite]"></div>
            </div>

            {/* Phone Image */}
            <div className="relative z-10">
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
              >
                <div className="relative">
                  {/* Phone Shadow */}
                  <div className="absolute inset-0 bg-gradient-to-b from-olive/30 to-purple-500/20 rounded-[3rem] blur-2xl scale-95 translate-y-8"></div>

                  {/* Phone Image */}
                  <motion.img
                    src="/小程序图片/首页+个人主页/首页.jpg"
                    alt="山药铭记小程序首页"
                    className="relative w-[280px] sm:w-[320px] lg:w-[340px] rounded-[2.5rem] shadow-2xl ring-1 ring-black/10"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Floating Badge 1 */}
                  <motion.div
                    className="absolute -right-8 top-16 glass-strong rounded-2xl p-3.5 shadow-lg"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 1, ease: "easeInOut" }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <span className="text-green-600 text-base">📚</span>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-warm-ink">今日已背</div>
                        <div className="text-sm font-bold text-olive">28 条文</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Floating Badge 2 */}
                  <motion.div
                    className="absolute -left-10 bottom-28 glass-strong rounded-2xl p-3.5 shadow-lg"
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 5, repeat: Infinity, delay: 2, ease: "easeInOut" }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-olive/10 flex items-center justify-center">
                        <span className="text-olive text-base">🔥</span>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-warm-ink">连续打卡</div>
                        <div className="text-sm font-bold text-warm-accent">7 天</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Floating Badge 3 */}
                  <motion.div
                    className="absolute -right-6 bottom-12 glass-strong rounded-2xl p-3 shadow-lg"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, delay: 0.5, ease: "easeInOut" }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <span className="text-amber-600 text-sm">⭐</span>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-warm-ink">积分 +5</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-warm-muted/30 flex items-start justify-center p-1.5"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <motion.div
            className="w-1.5 h-3 rounded-full bg-olive"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
        <p className="text-xs text-warm-muted/50 mt-2 text-center">向下滚动</p>
      </motion.div>
    </section>
  );
}
