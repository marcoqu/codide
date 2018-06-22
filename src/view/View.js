import { select } from 'd3-selection';

import { library, dom } from '@fortawesome/fontawesome-svg-core';
import {
    faFire,
    faFlask,
    faChalkboardTeacher,
    faSyncAlt,
    faTimes,
    faBars,
    faExpandArrowsAlt,
    faFlag,
    faBuilding,
    // @ts-ignore
} from '@fortawesome/free-solid-svg-icons';

import WhiteBoard from './whiteboard/WhiteBoard';
import Panel from './panel/Panel';

library.add([
    faFire,
    faFlask,
    faChalkboardTeacher,
    faSyncAlt,
    faFlag,
    faBuilding,
    faTimes,
    faBars,
    faExpandArrowsAlt]);

dom.watch();

export default class View {

    constructor(model, config) {
        this._model = model;
        this._model.dataChanged.add(() => this._onDataChanged())
        this._container = select(window.document.body);

        this._whiteBoard = new WhiteBoard(this._model, this._container, config);

        this._panel = new Panel(this._model, this._container);
        this._panel.categoryHovered.add(val => this._whiteBoard.highlightCategory(val));

        select('#rescale-button').on('click', () => this._whiteBoard.zoomToBounds());
    }

    _onDataChanged() {
        select('#loading').style('display', 'none');
    }

}
