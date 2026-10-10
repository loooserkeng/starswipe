import React, { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { BRAND_CONFIG } from '../lib/brand.js';

export const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 md:py-16">
      <h1 className="text-3xl font-extrabold text-[#F7F7FA] font-display mb-2">
        Contact {BRAND_CONFIG.name}
      </h1>
      <p className="text-xs sm:text-sm text-[#A1A1B5] mb-8">
        Have questions about actress profiles, content rights, or editorial moderation? Send us a message.
      </p>

      {submitted ? (
        <div className="p-8 rounded-2xl bg-[#15151C] border border-emerald-500/40 text-center flex flex-col items-center">
          <CheckCircle className="w-12 h-12 text-emerald-400 mb-3" />
          <h2 className="text-lg font-bold text-[#F7F7FA]">Message Dispatched</h2>
          <p className="text-xs text-[#A1A1B5] mt-1">
            Thank you for reaching out. We will get back to you at {formData.email} as soon as possible.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#15151C] border border-[#232331] flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#A1A1B5] font-medium">Your Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-[#0B0B0F] border border-[#262635] rounded-xl p-3 text-xs text-[#F7F7FA]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#A1A1B5] font-medium">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-[#0B0B0F] border border-[#262635] rounded-xl p-3 text-xs text-[#F7F7FA]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#A1A1B5] font-medium">Subject</label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="bg-[#0B0B0F] border border-[#262635] rounded-xl p-3 text-xs text-[#F7F7FA]"
            >
              <option value="General Inquiry">General Inquiry</option>
              <option value="Profile Correction">Profile or Filmography Correction</option>
              <option value="Copyright or DMCA">Copyright / DMCA Takedown</option>
              <option value="Moderation Appeal">Moderation Appeal</option>
              <option value="Press or Partnerships">Press or Partnerships</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#A1A1B5] font-medium">Message</label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="bg-[#0B0B0F] border border-[#262635] rounded-xl p-3 text-xs text-[#F7F7FA] resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-xl font-semibold text-xs bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white hover:opacity-95 transition-all"
          >
            Send Message
          </button>
        </form>
      )}
    </div>
  );
};
