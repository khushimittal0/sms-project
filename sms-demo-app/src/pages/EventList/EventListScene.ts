import { SceneAppPage, EmbeddedScene, SceneReactObject } from '@grafana/scenes';
import { ROUTES } from '../../constants';
import { EventListPage } from './EventListPage';

export const eventListPage = new SceneAppPage({
  title: '',

  url: '/event-list',
  routePath: ROUTES.EventList,

  getScene: () =>
    new EmbeddedScene({
      body: new SceneReactObject({
        component: EventListPage,
      }),
    }),
});
