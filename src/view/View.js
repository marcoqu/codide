import * as d3 from 'd3';

// @ts-ignore
import * as fontawesome from '@fortawesome/fontawesome';
// @ts-ignore
import solid from '@fortawesome/fontawesome-free-solid';

import WhiteBoard from './whiteboard/WhiteBoard';
import Panel from './panel/Panel';

fontawesome.library.add(solid);

export default class View {
    constructor(model) {
        this._model = model;

        this._wb = new WhiteBoard(this._model, window.document.body);
        this._panel = new Panel(this._model, window.document.body);
        this._panel.hovered.add(val => this._wb.highlightNotes(val));

        d3.select('#rescale-button').on('click', () => {
            this._wb.zoomToBounds();
        });
    }
}
