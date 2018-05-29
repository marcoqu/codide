// @ts-ignore
import * as fontawesome  from "@fortawesome/fontawesome";
// @ts-ignore
import solid from '@fortawesome/fontawesome-free-solid';

fontawesome.library.add(solid);

import { WhiteBoard } from "./whiteboard/WhiteBoard";
import { Panel } from "./panel/Panel";

export class View {

    constructor(model) {
        this._model = model;
        // this._initElements();

        this._wb = new WhiteBoard(this._model, window.document.body);
        this._panel = new Panel(this._model, window.document.body);
    }

    _initElements() {
        // window.document.body;
    }

}