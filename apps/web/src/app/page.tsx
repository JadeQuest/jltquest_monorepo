import DashboardSvg from './DashboardSvg';

export default function HomePage() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-black flex items-center justify-center font-gilroyRegular">
      <div className="w-full h-full relative font-gilroyRegular">
        <DashboardSvg />
      </div>
    </main>
  );
}
