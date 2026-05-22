declare module "vinxi/http" {
  export function eventHandler(handler: (event: any) => any): any;
  export function toWebRequest(event: any): Request;
}
