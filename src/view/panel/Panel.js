import * as d3 from 'd3';
import { Signal } from 'signals';

export default class Panel {

    constructor(model, container) {
        this._model = model;
        this._menu = d3.select(container).select('#menu');

        this.categoryHovered = new Signal();

        this._initListeners();
    }

    _initListeners() {
        this._menu.select('#hamburger').on('click', () => this._onHambugerClicked());
        this._menu.select('.closebtn').on('click', () => this._onCloseClicked());

        this._menu.selectAll('.pillars-cb').on('click', () => this._onFilterChange());
        this._menu.selectAll('.themes-cb').on('click', () => this._onFilterChange());

        this._menu.selectAll('.checkbox-wrapper').on('mouseover', (d, i, g) => this._onCheckBoxOver(d, i, g));
        this._menu.selectAll('.checkbox-wrapper').on('mouseout', () => this._onCheckBoxOut());
    }

    // USER HANDLERS

    _onFilterChange() {
        const pillars = [...this._menu.selectAll('.pillars-cb').nodes()]
            .filter(e => e.checked)
            .map(e => e.value);

        const themes = [...this._menu.selectAll('.themes-cb').nodes()]
            .filter(e => e.checked)
            .map(e => e.value);

        this._model.setFilters(pillars, themes);
    }

    _onHambugerClicked() {
        this._menu.classed('open', true);
    }

    _onCloseClicked() {
        this._menu.classed('open', false);
    }

    _onCheckBoxOver(d, i, g) {
        const category = d3.select(g[i]).select('input').property('value');
        this.categoryHovered.dispatch(category);
    }

    _onCheckBoxOut() {
        this.categoryHovered.dispatch(null);
    }

}
