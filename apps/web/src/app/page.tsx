import styles from './page.module.css';

import BackgroundShapes from './BackgroundShapes';

export default function HomePage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Zen+Dots&display=swap" rel="stylesheet" />

      <div className={styles.wrapper}>
        <div className={styles.canvas}>
          {/* Pure SVG background shapes directly from Figma */}
          <BackgroundShapes />
          
          {/* Foreground elements */}
          <div className={styles.mascot}></div>
          <div className={styles.welcomeText}>Welcome to</div>
          <div className={styles.jltText}>jlt</div>
          <div className={styles.partnerText}>
            A Trusted<br />Partner of<br />JAXMART
          </div>
        </div>
      </div>
    </>
  );
}
