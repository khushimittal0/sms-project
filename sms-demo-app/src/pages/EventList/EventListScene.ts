import { SceneAppPage, EmbeddedScene, SceneReactObject } from '@grafana/scenes';
import { prefixRoute } from '../../utils/utils.routing';
import { ROUTES } from '../../constants';
import { EventListPage } from './EventListPage';



export const eventListPage = new SceneAppPage({
  title: 'Event List',

  url: prefixRoute(ROUTES.EventList),
  routePath: ROUTES.EventList,

  getScene: () =>
    new EmbeddedScene({
      body: new SceneReactObject({
        component: EventListPage,
      }),
    }),
});
