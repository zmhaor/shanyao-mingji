import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Feedback() {
  const [form, setForm] = useState({ title: '', content: '', contact: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    setSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-6 md:px-12 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-semibold serif text-warm-ink mb-4">感谢您的反馈！</h2>
          <p className="text-warm-muted mb-8">我们会认真阅读每一条反馈，不断改进产品体验。</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-olive to-olive-light text-white font-medium shadow-lg shadow-olive/20 hover:shadow-olive/40 transition-all"
          >
            返回首页
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 md:px-12">
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
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold serif text-warm-ink">意见反馈</h1>
            <p className="text-warm-muted text-sm mt-1">您的建议是我们前进的动力</p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="glass-strong rounded-3xl p-8 md:p-12 mb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-warm-ink mb-2">标题（可选）</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="简要描述您的反馈类型"
              className="w-full px-4 py-3 rounded-xl glass text-warm-ink placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-olive/30 transition-all"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-warm-ink mb-2">
              反馈内容 <span className="text-warm-accent">*</span>
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="请详细描述您的问题、建议或发现的错别字..."
              rows={6}
              required
              className="w-full px-4 py-3 rounded-xl glass text-warm-ink placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-olive/30 transition-all resize-none"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-warm-ink mb-2">联系方式（可选）</label>
            <input
              type="text"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              placeholder="邮箱或微信号，方便我们回复您"
              className="w-full px-4 py-3 rounded-xl glass text-warm-ink placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-olive/30 transition-all"
            />
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={submitting || !form.content.trim()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-olive to-olive-light text-white font-medium shadow-lg shadow-olive/20 hover:shadow-olive/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                提交反馈
              </>
            )}
          </motion.button>
        </div>

        <p className="text-warm-muted text-xs text-center mt-4">
          您也可以通过小程序内「我的」→「意见反馈」提交反馈
        </p>
      </motion.form>
    </div>
  );
}
