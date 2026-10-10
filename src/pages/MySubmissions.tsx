import React, { useState, useEffect } from 'react';
import { ActressImage } from '../lib/types.js';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Clock, CheckCircle, XCircle, Trash2, ArrowRight } from 'lucide-react';

interface MySubmissionsProps {
  navigate: (route: string) => void;
}

export const MySubmissions: React.FC<MySubmissionsProps> = ({ navigate }) => {
  const { voterId } = useAuth();
  const [submissions, setSubmissions] = useState<ActressImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getMySubmissions(voterId).then((data) => {
      setSubmissions(data);
      setIsLoading(false);
    }).catch(console.error);
  }, [voterId]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
      <div className="flex items-center justify-between pb-6 border-b border-[#232331]">
        <div>
          <h1 className="text-3xl font-extrabold text-[#F7F7FA] font-display">
            My Portrait Submissions
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1B5] mt-1">
            Track status and editorial approval of portraits you have submitted.
          </p>
        </div>

        <button
          onClick={() => navigate('/upload')}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white shadow-lg hover:opacity-95 transition-opacity"
        >
          Submit New
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-[#15151C] animate-pulse border border-[#232331]" />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#A1A1B5] rounded-2xl bg-[#15151C] border border-[#232331]">
          You have not submitted any actress portraits yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {submissions.map((sub) => {
            const isApproved = sub.moderation_status === 'approved';
            const isPending = sub.moderation_status === 'pending';
            const isRejected = sub.moderation_status === 'rejected';

            return (
              <div
                key={sub.id}
                className="rounded-2xl bg-[#15151C] border border-[#232331] overflow-hidden flex flex-col shadow-xl"
              >
                <div className="relative aspect-[3/4] bg-[#0B0B0F]">
                  <img
                    src={sub.storage_path}
                    alt={sub.actress_name || 'Portrait'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {/* Status Overlay */}
                  <div className="absolute top-3 right-3">
                    {isApproved && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 backdrop-blur-md">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approved
                      </span>
                    )}
                    {isPending && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-950/90 text-amber-300 border border-amber-500/40 flex items-center gap-1 backdrop-blur-md">
                        <Clock className="w-3.5 h-3.5" />
                        In Review
                      </span>
                    )}
                    {isRejected && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-950/90 text-rose-300 border border-rose-500/40 flex items-center gap-1 backdrop-blur-md">
                        <XCircle className="w-3.5 h-3.5" />
                        Rejected
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-2">
                  <div className="font-semibold text-sm text-[#F7F7FA] font-display">
                    {sub.actress_name || 'Suggested Profile'}
                  </div>
                  <div className="text-[11px] text-[#A1A1B5]">
                    Submitted: {new Date(sub.created_at).toLocaleDateString()}
                  </div>

                  {sub.rejection_reason && (
                    <div className="mt-2 p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-300">
                      Reason: {sub.rejection_reason}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
