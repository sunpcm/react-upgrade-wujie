declare interface Window {
  $wujie?: {
    bus: any;
    shadowRoot?: ShadowRoot;
    props?: Record<string, any>;
    location?: object;
  };
  __POWERED_BY_WUJIE__?: boolean;
}
