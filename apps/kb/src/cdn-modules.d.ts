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
