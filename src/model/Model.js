import * as d3 from 'd3';
import { Signal } from 'signals';
import { intersection } from 'lodash-es';

import Note from './Note';

export default class Model {

    constructor(config) {
        this._sheetUrl = config.sheetUrl;
        if (!this._sheetUrl) { throw new Error('No Spreadsheet id found. Check the config/config.json file.'); }

        this._pollingDelay = config.pollingSeconds || Model.POLLING_SECONDS;
        this._activePillars = [];
        this._activeThemes = [];

        this.dataChanged = new Signal();
    }

    setFilters(pillars, themes) {
        this._activePillars = pillars;
        this._activeThemes = themes;
        this._updateData();
    }

    startPolling() {
        this.loadData();
        this._poller = setInterval(() => this.loadData(), 1000 * this._pollingDelay);
    }

    stopPolling() {
        clearInterval(this._poller);
    }

    saveLocalStorage() {
        const obj = this._notes.reduce((memo, note, idx) => {
            memo[idx] = {
                x: note.x,
                y: note.y,
                color: note.color,
            };
            return memo;
        }, {});
        window.localStorage.setItem('localData', JSON.stringify(obj));
    }

    clearLocalStorage() {
        window.localStorage.clear();
        this._notes.forEach(n => n.clearMergedData());
        this._updateData();
    }

    async loadData() {
        const rawData = await this._loadSpreadsheetCSV();
        const storedData = this._loadLocalStorage();
        this._notes = this._parseNotes(rawData, storedData);
        this._updateData();
    }

    // HELPERS

    _updateData() {
        const filtered = this._notes.filter(n => this._filterData(n));
        this.dataChanged.dispatch(filtered);
    }

    _filterData(n) {
        const pillarMatch = !n._pillars.length ||
                        !this._activePillars.length ||
                        !!intersection(n._pillars, this._activePillars).length;
        const themesMatch = !n._themes.length ||
                        !this._activeThemes.length ||
                        !!intersection(n._themes, this._activeThemes).length;
        return pillarMatch && themesMatch;
    }

    async _loadSpreadsheetCSV() {
        return new Promise((resolve) => {
            Tabletop.init({
                key: this._sheetUrl,
                simpleSheet: true,
                callback: data => resolve(data),
            });
        });
    }

    _parseNotes(rawData, storedData) {
        return rawData
            .filter(row => !!row.Timestamp)
            .map((row, idx) => {
                const storedItem = storedData[idx] || {};
                return new Note(idx, { ...row, ...storedItem });
            });
    }

    // LOCAL STORAGE

    _loadLocalStorage() {
        const jsonStr = window.localStorage.getItem('localData') || '{}';
        return JSON.parse(jsonStr);
    }

}

Model.POLLING_SECONDS = 10;
