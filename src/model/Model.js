import { Signal } from 'signals';
import { intersection } from 'lodash-es';
import Tabletop from 'tabletop';
import Note from './Note';

export default class Model {

    constructor(config) {
        this._sheetUrl = config.sheetUrl;
        if (!this._sheetUrl) { throw new Error('No Spreadsheet id found. Check the config/config.json file.'); }

        this._pollingDelay = config.pollingSeconds || Model.POLLING_SECONDS;
        this._activePillars = [];
        this._activeThemes = [];

        this.dataChanged = new Signal();
        this.uid = this.getUid() || this.createUid();
    }

    setFilters(pillars, themes) {
        this._activePillars = pillars;
        this._activeThemes = themes;
        this.saveLocalStorage();
        this._updateData();
    }

    getPillarFilters() {
        return this._activePillars;
    }

    getThemeFilters() {
        return this._activeThemes;
    }

    startPolling() {
        this.loadData(true);
        this._poller = setInterval(() => {
            this.loadData(false);
            this.logData();
        }, 1000 * this._pollingDelay);
    }

    stopPolling() {
        clearInterval(this._poller);
    }

    saveLocalStorage() {
        window.localStorage.setItem('localData', this.serializeData());
    }

    serializeData() {
        const notes = this._notes.reduce((memo, note, idx) => {
            memo[idx] = {
                x: note.x,
                y: note.y,
                color: note.color,
            };
            return memo;
        }, {});

        const filters = {
            pillars: this._activePillars,
            themes: this._activeThemes,
        };

        return JSON.stringify({
            id: this.getUid(),
            timestamp: (new Date()).getTime(),
            notes,
            filters,
        });
    }

    logData() {
        if (!this._notes) { return; }
        fetch('http://knowledgecartography.org/codidelog/log.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: this.serializeData(),
        });
    }

    createUid() {
        const uid = Math.floor(Math.random() * 100000000000).toString();
        window.localStorage.setItem('uid', uid);
        return uid;
    }

    getUid() {
        return window.localStorage.getItem('uid');
    }

    clearLocalStorage() {
        window.localStorage.clear();
        this._notes.forEach(n => n.clearMergedData());
        this._updateData();
    }

    async loadData(firstLoad) {
        const rawData = await this._loadSpreadsheetCSV();
        const storedData = firstLoad ? this._loadLocalStorage() : JSON.parse(this.serializeData());
        this._notes = this._parseNotes(rawData, storedData.notes || {}, firstLoad);
        this._activePillars = storedData.filters ? storedData.filters.pillars || [] : [];
        this._activeThemes = storedData.filters ? storedData.filters.themes || [] : [];
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

    _parseNotes(rawData, storedNotes, firstLoad) {
        return rawData
            .filter(row => !!row.Timestamp)
            .map((row, idx) => {
                const storedItem = storedNotes[idx] || {};
                return new Note(idx, { ...row, ...storedItem }, firstLoad);
            });
    }

    // LOCAL STORAGE

    _loadLocalStorage() {
        const jsonStr = window.localStorage.getItem('localData') || '{}';
        return JSON.parse(jsonStr);
    }

}

Model.POLLING_SECONDS = 10;
