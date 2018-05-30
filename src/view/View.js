import * as d3 from 'd3';

// @ts-ignore
import * as fontawesome from '@fortawesome/fontawesome';
// @ts-ignore
import solid from '@fortawesome/fontawesome-free-solid';

import WhiteBoard from './whiteboard/WhiteBoard';
import Panel from './panel/Panel';

fontawesome.library.add(solid);

export default class View {

    constructor(model, config) {
        this._model = model;
        this._container = window.document.body;

        this._whiteBoard = new WhiteBoard(this._model, this._container, config);

        this._panel = new Panel(this._model, this._container);
        this._panel.categoryHovered.add(val => this._whiteBoard.highlightCategory(val));

        d3.select('#rescale-button').on('click', () => this._whiteBoard.zoomToBounds());
    }

}
