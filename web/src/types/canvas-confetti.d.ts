declare module "canvas-confetti" {
  type Options = {
    particleCount?: number;
    spread?: number;
    angle?: number;
    startVelocity?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    scalar?: number;
  };
  const confetti: (opts?: Options) => Promise<void> | null;
  export default confetti;
}
