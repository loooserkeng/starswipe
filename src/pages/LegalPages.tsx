import React from 'react';
import { BRAND_CONFIG } from '../lib/brand.js';

export const Privacy: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-16 text-xs text-[#A1A1B5] leading-relaxed flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold text-[#F7F7FA] font-display">Privacy Policy</h1>
      <p>Last updated: October 2026</p>

      <div className="p-6 rounded-2xl bg-[#15151C] border border-[#232331] space-y-4">
        <h2 className="text-sm font-bold text-[#F7F7FA]">1. Data Minimization & Privacy-First Architecture</h2>
        <p>
          At {BRAND_CONFIG.name}, we do not track personal identities across the web, nor do we harvest invasive browser fingerprints. Guest voting utilizes server-issued anonymous session references that are periodically cycled and never linked to external data brokers.
        </p>

        <h2 className="text-sm font-bold text-[#F7F7FA]">2. Voting Records & Ledger Integrity</h2>
        <p>
          When you express preferences by swiping or tapping like/dislike, your action is recorded with your pseudonymous identifier or registered account ID. These records are retained strictly to compute leaderboard scores, prevent duplicate votes, and identify automated bot attacks.
        </p>

        <h2 className="text-sm font-bold text-[#F7F7FA]">3. Image Uploads & Metadata</h2>
        <p>
          Uploaded image files are processed on secure servers. Unnecessary EXIF metadata is stripped to protect user privacy. Submissions remain in private escrow until approved by editorial staff.
        </p>

        <h2 className="text-sm font-bold text-[#F7F7FA]">4. Contact & Deletion</h2>
        <p>
          Registered users may request account deletion or data exports at any time by contacting us at {BRAND_CONFIG.supportEmail}.
        </p>
      </div>
    </div>
  );
};

export const Terms: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-16 text-xs text-[#A1A1B5] leading-relaxed flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold text-[#F7F7FA] font-display">Terms of Service</h1>
      <p>Last updated: October 2026</p>

      <div className="p-6 rounded-2xl bg-[#15151C] border border-[#232331] space-y-4">
        <h2 className="text-sm font-bold text-[#F7F7FA]">1. Acceptance of Terms</h2>
        <p>
          By accessing or using {BRAND_CONFIG.name}, you agree to abide by these Terms of Service and our Community Guidelines. If you do not agree, do not use the service.
        </p>

        <h2 className="text-sm font-bold text-[#F7F7FA]">2. Voting Conduct</h2>
        <p>
          Automated voting, script execution, ballot-stuffing, rate-limit circumvention, or exploitation of voting endpoints is strictly prohibited. Accounts engaging in abusive voting will be permanently revoked.
        </p>

        <h2 className="text-sm font-bold text-[#F7F7FA]">3. User Content & Submissions</h2>
        <p>
          You warrant that any portraits submitted are public promotional materials, creative commons, or images you have lawful authorization to share. Unapproved commercial endorsements or non-consensual imagery will be removed immediately.
        </p>
      </div>
    </div>
  );
};

export const CommunityGuidelines: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-16 text-xs text-[#A1A1B5] leading-relaxed flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold text-[#F7F7FA] font-display">Community Guidelines</h1>

      <div className="p-6 rounded-2xl bg-[#15151C] border border-[#232331] space-y-4">
        <h2 className="text-sm font-bold text-[#F7F7FA]">1. Portrait Standards & Quality</h2>
        <p>
          {BRAND_CONFIG.name} is dedicated to celebrating cinema art. All submitted images must be high-resolution, tasteful portraits or editorial stills. Avoid low-resolution crops, heavy watermarks, promotional banners, or candid paparazzi shots.
        </p>

        <h2 className="text-sm font-bold text-[#F7F7FA]">2. Zero Tolerance for Non-Consensual Imagery</h2>
        <p>
          We strictly prohibit any explicit sexual content, non-consensual intimate imagery (NCII), deepfakes, or harassment. Any violation results in an immediate IP ban and referral to legal authorities.
        </p>

        <h2 className="text-sm font-bold text-[#F7F7FA]">3. Respectful Discourse</h2>
        <p>
          StarSwipe rankings reflect collective public appreciation. Hate speech, targeted abuse, or defamatory claims targeting any actress or community member are prohibited.
        </p>
      </div>
    </div>
  );
};

export const Copyright: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-16 text-xs text-[#A1A1B5] leading-relaxed flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold text-[#F7F7FA] font-display">Copyright Policy & DMCA Takedown</h1>

      <div className="p-6 rounded-2xl bg-[#15151C] border border-[#232331] space-y-4">
        <h2 className="text-sm font-bold text-[#F7F7FA]">Designated DMCA Agent Notice</h2>
        <p>
          {BRAND_CONFIG.name} respects the intellectual property rights of photographers, agencies, and artists. If you believe your copyrighted work has been reproduced without authorization, submit a notice containing:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Identification of the copyrighted photograph</li>
          <li>The exact StarSwipe URL where the image is located</li>
          <li>Proof of copyright ownership or agency representation</li>
          <li>Your contact information and statement under penalty of perjury</li>
        </ul>
        <p>
          Send all DMCA notifications to <span className="text-[#A78BFA]">{BRAND_CONFIG.supportEmail}</span> or submit a direct claim through our reporting tool. Valid notices are processed and expeditiously removed within 24 hours.
        </p>
      </div>
    </div>
  );
};
