/**
 * Lights.js
 * Premium gradient lighting rig for the AutoCon 3D scenes.
 * Provides purple/cyan accent lights matching the Kinetic Ether palette.
 */
export function HeroLights() {
  return (
    <>
      {/* Ambient fill */}
      <ambientLight intensity={0.3} />

      {/* Key light — warm top */}
      <pointLight position={[6, 8, 6]} intensity={2.5} color="#ffffff" />

      {/* Purple rim — left */}
      <pointLight position={[-8, 4, -2]} intensity={3.0} color="#7C3AED" />

      {/* Cyan fill — right */}
      <pointLight position={[8, -2, 4]} intensity={2.5} color="#06B6D4" />

      {/* Blue under light */}
      <pointLight position={[0, -6, 2]} intensity={1.5} color="#2563EB" />
    </>
  );
}

export function DashboardLights() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 8, 4]} intensity={1.0} color="#7C3AED" />
      <pointLight position={[6, -4, 2]} intensity={0.8} color="#06B6D4" />
    </>
  );
}
