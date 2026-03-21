/// <reference types="vite/client" />

declare module "*.svg" {
  const content: { src: string; width: number; height: number };
  export default content;
}

declare module "*.svg?react" {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}
