import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#80a0c3] flex items-center justify-center p-4">
      <div className="bg-white neo-border shadow-[8px_8px_0px_#000000] p-10 max-w-md w-full text-center space-y-6">
        <div className="text-8xl font-black">404</div>
        <h1 className="text-3xl font-black uppercase">Page introuvable</h1>
        <p className="text-gray-600 font-bold">
          Cette destination n&apos;existe pas... mais il y en a plein d&apos;autres à découvrir !
        </p>
        <Link
          href="/"
          className="inline-block neo-button bg-[#FFE951] hover:bg-[#ffd91a] font-black px-6 py-3 text-lg uppercase"
        >
          🎲 Retour à la roue
        </Link>
      </div>
    </div>
  );
}
