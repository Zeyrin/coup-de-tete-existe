'use client';

interface PremiumBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function PremiumBadge({
  size = 'md',
  showText = true,
}: PremiumBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-bold
        bg-gradient-to-r from-[#FFD700] to-[#FFA500]
        text-black rounded-full
        ${sizeClasses[size]}
      `}
    >
      <span>👑</span>
      {showText && <span>Premium</span>}
    </span>
  );
}
