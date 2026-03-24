/**
 * Lights.jsx (was .js — renamed to support JSX syntax)
 * Premium gradient lighting rig for the AutoCon 3D scenes.
 */

export function HeroLights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[6, 8, 6]}   intensity={2.5} color="#ffffff" />
      <pointLight position={[-8, 4, -2]} intensity={3.5} color="#7C3AED" />
      <pointLight position={[8, -2, 4]}  intensity={3.0} color="#67e8f9" />
      <pointLight position={[0, -6, 2]}  intensity={2.0} color="#2563EB" />
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
