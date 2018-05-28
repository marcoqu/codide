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
        this._panelContainer = d3.select("#menu");

        this._initElements();
    }

    _initElements() {
        this._panelContainer.select("#hamburger").on("click", () => this._onHambugerClicked());
        this._panelContainer.select(".closebtn").on("click", () => this._onCloseClicked());

        this._panelContainer.selectAll(".pillars-cb").on("click", () => this._onChange());
        this._panelContainer.selectAll(".themes-cb").on("click", () => this._onChange());
    }

    _onChange() {
        const pillars = [...this._panelContainer.selectAll(".pillars-cb").nodes()]
            .filter(e => e.checked)
            .map(e => e.value);

        const themes = [...this._panelContainer.selectAll(".themes-cb").nodes()]
            .filter(e => e.checked)
            .map(e => e.value);

        this._model.setFilters(pillars, themes);
    }

    _onHambugerClicked() {
        this._panelContainer.classed("open", true);
    }

    _onCloseClicked() {
        this._panelContainer.classed("open", false);
    }

}