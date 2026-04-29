import { SceneAppPage, EmbeddedScene, SceneReactObject } from '@grafana/scenes';
import { ClassificationPage } from './ClassificationPage';

export const classificationPage = new SceneAppPage({
  title: 'Classification',
  url: '/a/sms-demo-app/configuration/classification',
  routePath: 'configuration/classification',

  getScene: () =>
    new EmbeddedScene({
      body: new SceneReactObject({
        component: ClassificationPage,
      }),
    }),
});
