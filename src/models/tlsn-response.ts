export interface TlsnPluginResponse {
  data: string;
  meta: {
    notaryUrl: string;
    websocketProxyUrl: string;
  };
  version: string;
}
