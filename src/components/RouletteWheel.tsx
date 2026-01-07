// Roulette Wheel Component
export default function RouletteWheel({ isSpinning }: { isSpinning: boolean }) {
  return (
    <div className="relative w-80 h-80 max-[400px]:w-52 max-[400px]:h-52 mx-auto mb-8">
      {/* Pointer/Arrow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 max-[400px]:-translate-y-2 z-20">
        <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-black max-[400px]:border-l-[12px] max-[400px]:border-r-[12px] max-[400px]:border-t-[24px]"></div>
      </div>

      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full neo-border bg-white neo-shadow pulse-ring"></div>

      {/* Spinning wheel - solid color with rotating emoji */}
      <div className={`absolute inset-4 rounded-full neo-border bg-[#FF6B6B] flex items-center justify-center ${isSpinning ? 'roulette-spin' : ''}`}>
        <span className="text-8xl max-[400px]:text-6xl">🎲</span>
      </div>
    </div>
  );
}
