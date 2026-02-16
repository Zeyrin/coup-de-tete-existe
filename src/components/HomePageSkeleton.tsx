"use client";

export default function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-[#80a0c3] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-10 w-64 bg-white/30 rounded neo-border" />
        <div className="h-6 w-48 bg-white/20 rounded" />
        <div className="h-48 w-72 bg-white/20 rounded neo-border mt-4" />
      </div>
    </div>
  );
}
