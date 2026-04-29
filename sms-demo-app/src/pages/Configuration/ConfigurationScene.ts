import { SceneAppPage, EmbeddedScene, SceneReactObject } from '@grafana/scenes';
import { ROUTES } from '../../constants';
import { ConfigurationTabsPage} from './ConfigurationTabspage';



export const configurationPage = new SceneAppPage({
  title: '',
  url: '/configuration',
  routePath: ROUTES.Configuration,


  getScene: () =>
    new EmbeddedScene({
      body: new SceneReactObject({
        component: ConfigurationTabsPage,
      }),
    }),
    

});
