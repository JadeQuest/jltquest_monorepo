import styles from './page.module.css';

import DashboardSvg from './DashboardSvg';

export default function HomePage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Zen+Dots&display=swap" rel="stylesheet" />

      <div className={styles.wrapper}>
        <div className={styles.canvas}>
          {/* Fully fidelity vector layout directly from Figma */}
          <DashboardSvg />
        </div>
      </div>
    </>
  );
}

