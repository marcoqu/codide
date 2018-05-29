import * as d3 from "d3";
import { Signal } from "signals";
import { intersection } from "lodash-es";

import { Note } from "./Note";

export class Model {

    constructor(sheetId) {
        this._sheetId = sheetId;
        this.dataChanged = new Signal();
        this._activePillars = [];
        this._activeThemes = [];
    }

    setFilters(pillars, themes) {
        this._activePillars = pillars;
        this._activeThemes = themes;
        this.update();
    }

    startPolling() {
        console.log("start polling");
        this.loadData()
        this._poller = setInterval(() => this.loadData(), 1000 * 30); // 30 seconds
    }
    
    stopPolling() {
        console.log("stop polling");
        clearInterval(this._poller);
    }

    update() {
        const filtered = this._notes.filter(n => this._filterData(n));
        this.dataChanged.dispatch(filtered);
        console.log("data updated");
    }
    
    async loadData() {
        const rawData = await this._loadCSV();
        const storedData = this._loadStorage();
        this._notes = this._parse(rawData, storedData);
        this.update();
    }

    /**
     * 
     * @param {Note} n 
     */
    _filterData(n) {
        const pillarMatch = !n._pillars.length || !this._activePillars.length || !!intersection(n._pillars, this._activePillars).length
        const themesMatch = !n._themes.length || !this._activeThemes.length || !!intersection(n._themes, this._activeThemes).length
        return pillarMatch && themesMatch;
    }

    async _loadCSV() {
        const url = `https://docs.google.com/spreadsheets/d/e/${this._sheetId}/pub?output=csv`;
        return d3.csv(url);
    }

    _loadStorage() {
        const jsonStr = window.localStorage.getItem("localData") || "{}";
        return JSON.parse(jsonStr);
    }

    _saveStorage() {
        const obj = this._notes.reduce((memo, note, idx) => {
            memo[idx] = {
                x: note.x,
                y: note.y,
                color: note.color,
            };
            return memo;
        }, {});
        window.localStorage.setItem("localData", JSON.stringify(obj));
    }

    _parse(rawData, storedData) {
        return rawData.map((row, idx) => {
            const storedItem = storedData[idx] || {};
            return new Note(idx, {...row, ...storedItem});
        });
    }

}