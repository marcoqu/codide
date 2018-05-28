import * as d3 from "d3";

import { Model } from "../../model/Model";

export class Panel {

    /**
     * 
     * @param {Model} model 
     * @param {HTMLElement} container 
     */
    constructor(model, container) {
        this._model = model;
        this._container = d3.select(container);

        this._initElements();
    }

    _initElements() {
        this._container.select("#hamburger").on("click", () => this._onHambugerClicked());
        this._container.select("#close").on("click", () => this._onCloseClicked());

        this._container.selectAll("pillars-cb").on("change", () => this._onChange());
        this._container.selectAll("themes-cb").on("change", () => this._onChange());
    }

    _onChange() {
        const pillars = [...this._container.selectAll("pillars-cb").nodes()]
            .filter(e => e.checked)
            .map(e => e.value);

        const themes = [...this._container.selectAll("themes-cb").nodes()]
            .filter(e => e.checked)
            .map(e => e.value);

        this._model.setFilters(pillars, themes);
    }

    _onHambugerClicked() {
        this._container.classed("open", true);
    }

    _onCloseClicked() {
        this._container.classed("open", false);
    }

}