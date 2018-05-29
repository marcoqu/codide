import * as d3 from "d3";
import { Signal } from "signals";

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
        this.hovered = new Signal();

        this._initElements();
    }

    _initElements() {
        this._panelContainer.select("#hamburger").on("click", () => this._onHambugerClicked());
        this._panelContainer.select(".closebtn").on("click", () => this._onCloseClicked());

        this._panelContainer.selectAll(".pillars-cb").on("click", () => this._onChange());
        this._panelContainer.selectAll(".themes-cb").on("click", () => this._onChange());
        
        this._panelContainer.selectAll(".checkbox-wrapper").on("mouseover", (d,i,g) => this._onCbOver(d,i,g));
        this._panelContainer.selectAll(".checkbox-wrapper").on("mouseout", (d,i,g) => this._onCbOut(d,i,g));
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

    _onCbOver(d, i, g) {
        const val = d3.select(g[i]).select("input").property("value");
        this.hovered.dispatch(val);
    }
    
    _onCbOut(d, i, g) {
        this.hovered.dispatch(null);
    }

}