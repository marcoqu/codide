import { WhiteBoard } from "./whiteboard/WhiteBoard";
import { Panel } from "./panel/Panel";

import "./view.css";

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