/**
 * Centralized brand configuration for StarSwipe.
 * Easily customize name, tagline, and metadata from one location.
 */

export const BRAND_CONFIG = {
  name: "StarSwipe",
  shortName: "StarSwipe",
  tagline: "Your Vote. Their Ranking.",
  subTagline: "Discover actresses, share your preferences, and see who leads the rankings.",
  domain: "starswipe.app",
  supportEmail: "support@starswipe.app",
  copyrightYear: 2026,
  colors: {
    bg: "#0B0B0F",
    surface: "#15151C",
    surfaceSecondary: "#1D1D27",
    primary: "#A78BFA",
    primaryHover: "#8B5CF6",
    gold: "#F59E0B",
    text: "#F7F7FA",
    muted: "#A1A1B5",
    border: "#262635",
  },
  votePolicy: {
    allowGuestVotes: true,
    allowUndo: true,
    minVotesForLikeRateRank: 3,
    maxUploadSizeBytes: 5 * 1024 * 1024, // 5MB
    supportedFormats: ["image/jpeg", "image/png", "image/webp"],
  },
};
