/**
 * Splash
 * Pure HTML + CSS — no SVG element, no inline styles.
 * All visual rules live in globals.css under the db-* namespace.
 */
export default function Splash() {
  return (
    <div className="db-container">

      {/* ── Layer 1: Ambient glow blobs ── */}
      <div aria-hidden="true" className="db-glow db-glow--left-top" />
      <div aria-hidden="true" className="db-glow db-glow--left-bottom" />
      <div aria-hidden="true" className="db-glow db-glow--right-top" />
      <div aria-hidden="true" className="db-glow db-glow--right-bottom" />

      {/* ── Layer 2: Corner + edge vignette ── */}
      <div aria-hidden="true" className="db-vignette" />

      {/* ── Layer 3: "WELCOME TO" ── */}
      <div aria-label="Welcome to" className="db-welcome">
        <span className="db-welcome__word">WELCOME</span>
        <span className="db-welcome__word">TO</span>
      </div>

      {/* ── Layer 4: Giant "jlt" gradient letters ── */}
      <div className="db-jlt">
        <span aria-label="jlt" className="db-jlt__letters">
          jlt
          <span aria-hidden="true" className="db-jlt__overlay">jlt</span>
        </span>
      </div>

      {/* ── Layer 5: jlt.svg logo ── */}
      <img
        src="/jlt.svg"
        alt=""
        aria-hidden="true"
        className="db-logo"
      />

      {/* ── Layer 6: "A Trusted Partner of JAXMART" ── */}
      <div aria-label="A Trusted Partner of JAXMART" className="db-partner">
        <span className="db-partner__line">A Trusted</span>
        <span className="db-partner__line">Partner of</span>
        <span className="db-partner__line">JAXMART</span>
      </div>

      {/* ── Layer 7: Mascot ── */}
      <img
        src="/Mascot.svg"
        alt="JLT Quest Mascot"
        className="db-mascot"
      />

    </div>
  );
}
