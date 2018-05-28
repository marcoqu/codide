import * as d3 from "d3";
import { Signal } from "signals";

import { Note } from "./Note";

export class Model {

    constructor(sheetId) {
        this._sheetId = sheetId;
        this.dataChanged = new Signal();
    }

    startPolling() {
        console.log("polling");
        this._poller = setInterval(() => this.loadData(), 3000);
    }

    stopPolling() {
        clearInterval(this._poller);
    }
    
    async loadData() {
        const rawData = await this._loadCSV();
        const storedData = this._loadStorage();
        this._notes = this._parse(rawData, storedData);
        this.dataChanged.dispatch(this._notes);
        console.log("data loaded");
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