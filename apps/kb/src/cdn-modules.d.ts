// Ambient declarations for runtime ESM imports from esm.sh.
// These are loaded in the browser via dynamic import(); TypeScript has no
// resolver for `https://` specifiers, so we declare them as `any`.
declare module "https://esm.sh/3d-force-graph@1.73.4" {
  const ForceGraph3D: any;
  export default ForceGraph3D;
}
declare module "https://esm.sh/three-spritetext@1.9.4" {
  const SpriteText: any;
  export default SpriteText;
}

// js-yaml ships no types and @types/js-yaml isn't installed; we only use load().
declare module "js-yaml" {
  export function load(input: string): unknown;
  const _default: { load: typeof load };
  export default _default;
}
