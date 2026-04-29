import pluginJson from './plugin.json';

export const PLUGIN_BASE_URL = `/a/${pluginJson.id}`;

export enum ROUTES {
  Home = 'home',
  DelayManager = 'delay-manager',
  Configuration = 'configuration'
}

export const DATASOURCE_REF = {
  uid: 'gdev-testdata',
  type: 'testdata',
};
