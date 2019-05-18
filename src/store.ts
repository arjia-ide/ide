import thunk from 'redux-thunk';
import {init} from "@rematch/core"
import selectPlugin from '@rematch/select'
import createLoadingPlugin from '@rematch/loading'
import createRematchPersist from '@rematch/persist'
import * as models from "./redux/models";
import localForage from 'localforage';
import {config} from "./configuration";

const loading = createLoadingPlugin({});

const persistPlugin = createRematchPersist({
  whitelist: [
    'favorites',
    'app',
    'config',
    'ide',
  ],
  throttle: config.persistence.saveThrottle,
  version: 1,
  storage: localForage,
});

export function configureStore() {

  return init({
    models,
    plugins: [
      selectPlugin(),
      persistPlugin,
      loading
    ],
    redux: {
      middlewares: [
        thunk
      ],
    }
  });
}
