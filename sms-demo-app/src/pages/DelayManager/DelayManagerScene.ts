import { SceneAppPage, EmbeddedScene, SceneReactObject } from '@grafana/scenes';
import { prefixRoute } from '../../utils/utils.routing';
import { ROUTES } from '../../constants';
import { DelayManagerPage } from './DelayManagerPage';

export const delayManagerPage = new SceneAppPage({
  title: 'Delay Manager',

  url: prefixRoute(ROUTES.DelayManager),
  routePath: ROUTES.DelayManager,

  getScene: () =>
    new EmbeddedScene({
      body: new SceneReactObject({
        component: DelayManagerPage,
      }),
    }),
});
