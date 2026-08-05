import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="w-full min-h-screen bg-[#080411] text-white flex flex-col items-center justify-center p-6 text-center select-none font-gilroyRegular">
      <div className="glass-panel p-10 max-w-md w-full flex flex-col items-center gap-6 relative border border-white/10 shadow-2xl">
        <h1 className="font-gilroyBold text-7xl text-transparent bg-clip-text bg-gradient-to-r from-[#FFA28D] via-[#7B2CBF] to-[#00F0FF]">
          404
        </h1>
        <div className="flex flex-col gap-2">
          <h2 className="font-gilroyBold text-2xl text-white">Page Not Found</h2>
          <p className="font-gilroyRegular text-gray-400 text-sm leading-relaxed">
            The quest or page you are looking for does not exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="glass-btn px-6 py-3 rounded-xl font-gilroyBold text-white text-sm tracking-wide shadow-lg hover:shadow-[0_0_20px_#FFA28D] transition-all"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
