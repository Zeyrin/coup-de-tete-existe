'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#80a0c3] flex items-center justify-center p-4">
      <div className="bg-white neo-border shadow-[8px_8px_0px_#000000] p-10 max-w-md w-full text-center space-y-6">
        <div className="text-6xl">⚡</div>
        <h1 className="text-3xl font-black uppercase">Oups !</h1>
        <p className="text-gray-600 font-bold">
          Quelque chose a déraillé... Réessaie ou reviens à l&apos;accueil.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="neo-button bg-[#FFE951] hover:bg-[#ffd91a] font-black px-5 py-3 uppercase"
          >
            ↻ Réessayer
          </button>
          <Link
            href="/"
            className="neo-button bg-white hover:bg-gray-100 font-black px-5 py-3 uppercase"
          >
            ← Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
