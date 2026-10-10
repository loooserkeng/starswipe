import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, AlertCircle, FileText, ExternalLink } from 'lucide-react';
import { api } from '../lib/api.js';

interface SettingsProps {
  navigate: (route: string) => void;
}

export const Settings: React.FC<SettingsProps> = () => {
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getSetupStatus().then((res) => {
      setStatus(res);
      setIsLoading(false);
    }).catch(console.error);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
      <div className="pb-6 border-b border-[#232331]">
        <h1 className="text-3xl font-extrabold text-[#F7F7FA] font-display">
          System & Storage Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#A1A1B5] mt-1">
          Platform configuration, database connectivity, and backend diagnostics.
        </p>
      </div>

      {/* Supabase & Database Architecture Section */}
      <div className="rounded-2xl bg-[#15151C] border border-[#232331] p-6 flex flex-col gap-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-[#A78BFA]" />
            <h2 className="text-base font-bold font-display text-[#F7F7FA]">
              Database & Storage Integration
            </h2>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-[#232331] text-[#A78BFA]">
            {status?.storageMode === 'supabase' ? 'Supabase Live' : 'Persistent Local Engine'}
          </span>
        </div>

        <p className="text-xs text-[#A1A1B5] leading-relaxed">
          StarSwipe includes a comprehensive PostgreSQL + Supabase production architecture with full SQL schemas, storage bucket policies, and Row-Level Security rules. In development environments where external Supabase credentials are not connected, the platform operates on an atomic, file-backed persistent local database that preserves all votes, images, user accounts, and audit records across server restarts.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-[#0B0B0F] border border-[#232331]">
            <div className="text-[11px] text-[#71718A]">Supabase URL</div>
            <div className="text-xs font-mono text-[#F7F7FA] mt-1 truncate">
              {status?.supabase?.supabaseUrl || 'Not configured (Local mode)'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0B0B0F] border border-[#232331]">
            <div className="text-[11px] text-[#71718A]">Anon Public Key</div>
            <div className="text-xs font-mono text-[#F7F7FA] mt-1">
              {status?.supabase?.hasAnonKey ? 'Configured' : 'Local Fallback'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0B0B0F] border border-[#232331]">
            <div className="text-[11px] text-[#71718A]">Service Role Key</div>
            <div className="text-xs font-mono text-[#F7F7FA] mt-1">
              {status?.supabase?.hasServiceKey ? 'Configured (Server)' : 'Local Fallback'}
            </div>
          </div>
        </div>

        {/* Provided SQL Migrations */}
        <div className="mt-2 p-4 rounded-xl bg-[#0B0B0F] border border-[#232331]">
          <div className="text-xs font-semibold text-[#F7F7FA] mb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#A78BFA]" />
            <span>Ready-to-Deploy Production SQL Migrations:</span>
          </div>
          <ul className="text-xs text-[#A1A1B5] space-y-1.5 list-disc list-inside">
            <li>
              <code className="text-[#A78BFA]">supabase/schema.sql</code>: Complete 11 tables DDL with UUIDs, indexes, constraints, and audit logs.
            </li>
            <li>
              <code className="text-[#A78BFA]">supabase/rls_policies.sql</code>: Strict Row-Level Security policies for public reads, user voting uniqueness, and admin isolation.
            </li>
            <li>
              <code className="text-[#A78BFA]">supabase/storage_setup.sql</code>: Buckets configuration for public approved portraits and private pending submissions.
            </li>
          </ul>
        </div>
      </div>

      {/* Voting & Ranking Rules Info */}
      <div className="rounded-2xl bg-[#15151C] border border-[#232331] p-6 flex flex-col gap-4">
        <h2 className="text-base font-bold font-display text-[#F7F7FA]">
          Voting Engine Invariants
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#A1A1B5]">
          <div className="p-3 rounded-xl bg-[#0B0B0F] border border-[#232331]">
            <div className="font-semibold text-[#F7F7FA]">Vote Uniqueness</div>
            <p className="mt-1">
              Enforced at database constraint level on <code>(user_id, actress_id)</code>. Repeating the same vote is idempotent and does not increment counts.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#0B0B0F] border border-[#232331]">
            <div className="font-semibold text-[#F7F7FA]">Trending Calculation</div>
            <p className="mt-1">
              Weekly and monthly momentum are derived from <code>vote_events</code> within fixed 7-day and 30-day windows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
