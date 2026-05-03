import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Leaf, Heart, ArrowUp, Mail, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const footerLinks = {
  product: {
    title: "核心功能",
    links: [
      { label: "随时背机制", href: "#special-features", isAnchor: true },
      { label: "伤寒速速通", href: "#showcase", isAnchor: true },
      { label: "专区资料库", href: "/download" },
      { label: "积分商城", href: "/download" },
    ],
  },
  about: {
    title: "关于我们",
    links: [
      { label: "联系合作", href: "/about" },
      { label: "隐私政策", href: "/privacy" },
      { label: "用户协议", href: "/terms" },
      { label: "意见反馈", href: "/feedback" },
    ],
  },
  resource: {
    title: "学习资源",
    links: [
      { label: "伤寒论", href: "/download" },
      { label: "金匮要略", href: "/download" },
      { label: "温病条辨", href: "/download" },
      { label: "黄帝内经", href: "/download" },
    ],
  },
};

export function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = () => {
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="relative pt-24 pb-8 border-t border-warm-border/50 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-warm-bg/30 to-warm-bg/80 pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-gradient-to-t from-olive/3 to-transparent rounded-full blur-[80px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-4">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <motion.div
                className="w-12 h-12 rounded-xl glass-dark flex items-center justify-center text-white shadow-lg shadow-olive/20"
                whileHover={{ rotate: 12, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Leaf size={24} strokeWidth={2} />
              </motion.div>
              <div>
                <span className="serif font-bold text-xl tracking-wide text-warm-ink">山药铭记</span>
                <div className="text-xs text-warm-muted mt-0.5">中医学习随身助手</div>
              </div>
            </Link>
            <p className="text-warm-muted leading-relaxed max-w-sm mb-6 text-sm">
              山药铭记是一款基于微信小程序开发的专注中医学习与背诵的效率应用。致力于传承中医经典，助力天下中医同仁高效修习。
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {[
                { icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, label: "Twitter", href: "#" },
                { icon: <img src="https://api.iconify.design/mingcute:wechat-miniprogram-fill.svg" alt="Wechat" className="w-5 h-5 opacity-60" />, label: "微信", href: "/download" },
                { icon: <Mail className="w-5 h-5" />, label: "邮箱", href: "mailto:your-email@example.com" },
              ].map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.href}
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center text-warm-muted hover:text-olive hover:shadow-md transition-all duration-200"
                  whileHover={{ y: -3, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key} className="md:col-span-2">
              <h4 className="font-semibold text-warm-ink mb-5 text-sm">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, idx) => (
                  <li key={idx}>
                    {link.isAnchor ? (
                      <motion.a
                        href={link.href}
                        className="text-sm text-warm-muted hover:text-olive transition-colors duration-200 inline-flex items-center gap-1 group"
                        whileHover={{ x: 3 }}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/' + link.href);
                        }}
                      >
                        {link.label}
                      </motion.a>
                    ) : (
                      <Link to={link.href}>
                        <motion.span
                          className="text-sm text-warm-muted hover:text-olive transition-colors duration-200 inline-flex items-center gap-1 group cursor-pointer"
                          whileHover={{ x: 3 }}
                        >
                          {link.label}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                        </motion.span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="md:col-span-2">
            <h4 className="font-semibold text-warm-ink mb-5 text-sm">获取更新</h4>
            <p className="text-sm text-warm-muted mb-4 leading-relaxed">订阅通知，获取最新功能更新。</p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>已订阅</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="您的邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass text-sm text-warm-ink placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-olive/30 transition-all"
                />
                <motion.button
                  onClick={handleSubscribe}
                  className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-olive to-olive-light text-white text-sm font-medium hover:shadow-lg hover:shadow-olive/20 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  订阅
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="section-divider mb-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-warm-muted">
            <span>&copy; {new Date().getFullYear()} 山药铭记开发团队</span>
            <span className="text-warm-border">|</span>
            <span className="flex items-center gap-1">
              用 <Heart className="w-3.5 h-3.5 text-warm-accent fill-warm-accent" /> 传承中医
            </span>
          </div>

          {/* Back to Top */}
          <motion.button
            onClick={scrollToTop}
            className="group flex items-center gap-2 text-sm text-warm-muted hover:text-olive transition-colors"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>回到顶部</span>
            <div className="w-8 h-8 rounded-lg glass flex items-center justify-center group-hover:shadow-md transition-all">
              <ArrowUp className="w-4 h-4" />
            </div>
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
