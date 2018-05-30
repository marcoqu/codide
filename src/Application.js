import Model from './model/Model';
import View from './view/View';

// @ts-ignore
import config from './config/config.json';
import './styles.css';

export default class Application {

    constructor() {
        this._model = new Model(config);
        this._view = new View(this._model, config);
        this._model.startPolling();
    }

}
