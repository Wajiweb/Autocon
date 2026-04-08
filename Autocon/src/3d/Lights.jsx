// A unified LightRig to reduce file size and support CSS Variables
const LightRig = ({ isHero = false }) => {
  return (
    <>
      <ambientLight intensity={isHero ? 0.4 : 0.15} />
      
      {/* Primary Brand Light */}
      <pointLight 
        position={isHero ? [-8, 4, -2] : [0, 8, 4]} 
        intensity={isHero ? 3.5 : 1.0} 
        color="var(--color-primary)" 
      />

      {/* Secondary Brand Light */}
      <pointLight 
        position={isHero ? [8, -2, 4] : [6, -4, 2]} 
        intensity={isHero ? 3.0 : 0.8} 
        color="var(--color-secondary)" 
      />

      {/* Hero-Only Accent Lights */}
      {isHero && (
        <>
          <pointLight position={[6, 8, 6]} intensity={2.5} color="#ffffff" />
          <pointLight position={[0, -6, 2]} intensity={2.0} color="var(--color-accent)" />
        </>
      )}
    </>
  );
};

export const HeroLights = () => <LightRig isHero />;
export const DashboardLights = () => <LightRig />;