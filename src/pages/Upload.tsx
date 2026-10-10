import React, { useState, useEffect } from 'react';
import { Upload as UploadIcon, CheckCircle, AlertTriangle, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { Actress, Category } from '../lib/types.js';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';

interface UploadProps {
  navigate: (route: string) => void;
}

export const Upload: React.FC<UploadProps> = ({ navigate }) => {
  const { user, voterId } = useAuth();
  const [actresses, setActresses] = useState<Actress[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedActressId, setSelectedActressId] = useState<string>('');
  const [newActressName, setNewActressName] = useState<string>('');
  const [categorySlug, setCategorySlug] = useState<string>('');
  const [sourceUrl, setSourceUrl] = useState<string>('');
  const [attribution, setAttribution] = useState<string>('');
  const [rightsConfirmed, setRightsConfirmed] = useState<boolean>(false);
  const [guidelinesConfirmed, setGuidelinesConfirmed] = useState<boolean>(false);

  // Image preview & base64
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getActresses(), api.getCategories()]).then(([actList, catList]) => {
      setActresses(actList);
      setCategories(catList);
      if (catList.length > 0) setCategorySlug(catList[0].slug);
    }).catch(console.error);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setSubmitError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check MIME type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFileError('Invalid file type. Allowed formats: JPEG, PNG, or WebP.');
      return;
    }

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!imageBase64) {
      setSubmitError('Please choose a portrait image to upload.');
      return;
    }

    if (!selectedActressId && !newActressName.trim()) {
      setSubmitError('Please select an existing actress or provide a new name.');
      return;
    }

    if (!rightsConfirmed || !guidelinesConfirmed) {
      setSubmitError('You must confirm copyright ownership and agree to the Community Guidelines.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.uploadImage({
        uploaderId: voterId,
        actressId: selectedActressId || undefined,
        newActressName: !selectedActressId ? newActressName.trim() : undefined,
        categorySlug,
        sourceUrl: sourceUrl.trim() || undefined,
        attribution: attribution.trim() || undefined,
        imageBase64,
      });

      setSubmitSuccess(res.message);
      // Reset form
      setImagePreview(null);
      setImageBase64(null);
      setNewActressName('');
      setSelectedActressId('');
      setSourceUrl('');
      setAttribution('');
      setRightsConfirmed(false);
      setGuidelinesConfirmed(false);
    } catch (err: any) {
      setSubmitError(err.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="pb-6 border-b border-[#232331] mb-8">
        <h1 className="text-3xl font-extrabold text-[#F7F7FA] font-display">
          Submit Actress Portrait
        </h1>
        <p className="text-xs sm:text-sm text-[#A1A1B5] mt-1">
          Contribute high-quality portraits to StarSwipe. All submissions are placed in private escrow and verified by our editorial moderation team.
        </p>
      </div>

      {submitSuccess ? (
        <div className="p-8 rounded-2xl bg-[#15151C] border border-emerald-500/40 text-center flex flex-col items-center">
          <CheckCircle className="w-12 h-12 text-emerald-400 mb-3" />
          <h2 className="text-xl font-bold font-display text-[#F7F7FA]">Submission Received</h2>
          <p className="text-xs text-[#A1A1B5] mt-2 max-w-md leading-relaxed">
            {submitSuccess}
          </p>
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => setSubmitSuccess(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#232331] text-[#F7F7FA] hover:bg-[#2F2F42]"
            >
              Submit Another
            </button>
            <button
              onClick={() => navigate('/my-submissions')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white"
            >
              View My Submissions
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {submitError && (
            <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{submitError}</span>
            </div>
          )}

          {/* File Upload Box */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[#F7F7FA]">Portrait Image File *</label>
            <div className="relative border-2 border-dashed border-[#262635] hover:border-[#8B5CF6]/50 rounded-2xl p-6 flex flex-col items-center justify-center bg-[#15151C] transition-colors">
              {imagePreview ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-40 aspect-[3/4] rounded-xl overflow-hidden border border-[#232331] shadow-lg">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <label className="cursor-pointer text-xs font-medium text-[#A78BFA] hover:underline">
                    Change image
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center gap-2 py-4">
                  <div className="w-12 h-12 rounded-xl bg-[#232331] flex items-center justify-center text-[#A78BFA]">
                    <UploadIcon className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-[#F7F7FA]">Choose an image or drag & drop</div>
                  <div className="text-[11px] text-[#A1A1B5]">JPEG, PNG, or WebP up to 5MB</div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            {fileError && <span className="text-xs text-rose-400">{fileError}</span>}
          </div>

          {/* Target Actress Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#F7F7FA]">Existing Actress</label>
              <select
                value={selectedActressId}
                onChange={(e) => {
                  setSelectedActressId(e.target.value);
                  if (e.target.value) setNewActressName('');
                }}
                className="bg-[#15151C] border border-[#262635] rounded-xl p-3 text-xs text-[#F7F7FA] focus:outline-hidden focus:border-[#8B5CF6]"
              >
                <option value="">-- Choose from existing catalog --</option>
                {actresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.industry})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#F7F7FA]">Or Suggest New Actress</label>
              <input
                type="text"
                value={newActressName}
                onChange={(e) => {
                  setNewActressName(e.target.value);
                  if (e.target.value) setSelectedActressId('');
                }}
                placeholder="Full name of actress..."
                disabled={!!selectedActressId}
                className="bg-[#15151C] border border-[#262635] rounded-xl p-3 text-xs text-[#F7F7FA] placeholder-[#55556E] focus:outline-hidden focus:border-[#8B5CF6] disabled:opacity-40"
              />
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#F7F7FA]">Primary Category / Language *</label>
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="bg-[#15151C] border border-[#262635] rounded-xl p-3 text-xs text-[#F7F7FA] focus:outline-hidden focus:border-[#8B5CF6]"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Attribution & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#F7F7FA]">Source URL (Optional)</label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="bg-[#15151C] border border-[#262635] rounded-xl p-3 text-xs text-[#F7F7FA] placeholder-[#55556E] focus:outline-hidden focus:border-[#8B5CF6]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#F7F7FA]">Photographer / Attribution (Optional)</label>
              <input
                type="text"
                value={attribution}
                onChange={(e) => setAttribution(e.target.value)}
                placeholder="Studio, editorial credits..."
                className="bg-[#15151C] border border-[#262635] rounded-xl p-3 text-xs text-[#F7F7FA] placeholder-[#55556E] focus:outline-hidden focus:border-[#8B5CF6]"
              />
            </div>
          </div>

          {/* Compliance Checkboxes */}
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-[#15151C] border border-[#262635] text-xs text-[#A1A1B5]">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={rightsConfirmed}
                onChange={(e) => setRightsConfirmed(e.target.checked)}
                className="mt-0.5 rounded-sm accent-[#8B5CF6]"
              />
              <span>
                I confirm that I hold lawful rights or permission to share this image, and it contains no non-consensual or prohibited material.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={guidelinesConfirmed}
                onChange={(e) => setGuidelinesConfirmed(e.target.checked)}
                className="mt-0.5 rounded-sm accent-[#8B5CF6]"
              />
              <span>
                I have read and agree to the{' '}
                <button
                  type="button"
                  onClick={() => navigate('/community-guidelines')}
                  className="text-[#A78BFA] underline"
                >
                  Community Guidelines
                </button>
                .
              </span>
            </label>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white hover:opacity-95 disabled:opacity-50 transition-all shadow-lg"
          >
            {isSubmitting ? 'Uploading & Verifying Hash...' : 'Submit Portrait for Moderation'}
          </button>
        </form>
      )}
    </div>
  );
};
