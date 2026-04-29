import { SceneAppPage, EmbeddedScene, SceneReactObject } from '@grafana/scenes';
import { CrewPage } from './CrewPage';

export const crewPage = new SceneAppPage({
  title: 'Crew',
  url: '/a/sms-demo-app/configuration/crew',
  routePath: 'configuration/crew',

  getScene: () =>
    new EmbeddedScene({
      body: new SceneReactObject({
        component: CrewPage,
      }),
    }),
});
