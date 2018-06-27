import { select } from 'd3-selection';
import { Signal } from 'signals';

export default class Panel {

    constructor(model, container) {
        this._model = model;
        this._menu = container.select('#menu');
        this._model.dataChanged.add(() => this._onDataChanged());

        this.categoryHovered = new Signal();

        this._initListeners();
    }

    _initListeners() {
        this._menu.select('#hamburger').on('click', () => this._onHambugerClicked());
        this._menu.select('#clear-local-storage').on('click', () => this._onClearStorageClicked());
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

    _onClearStorageClicked() {
        this._model.clearLocalStorage();
        return false;
    }

    _onCloseClicked() {
        this._menu.classed('open', false);
    }

    _onCheckBoxOver(d, i, g) {
        const category = select(g[i]).select('input').property('value');
        this.categoryHovered.dispatch(category);
    }

    _onCheckBoxOut() {
        this.categoryHovered.dispatch(null);
    }

    _onDataChanged() {
        const pillars = this._model.getPillarFilters();
        const themes = this._model.getThemeFilters();

        [...this._menu.selectAll('.pillars-cb').nodes()].forEach((cb) => {
            if (pillars.includes(cb.value)) { cb.checked = true; }
        });

        [...this._menu.selectAll('.themes-cb').nodes()].forEach((cb) => {
            if (themes.includes(cb.value)) { cb.checked = true; }
        });
    }

}
