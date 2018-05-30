import * as d3 from "d3";

import { Model } from "../../model/Model";
import { Note } from "../../model/Note";

// @ts-ignore
import noteTpl from "./note.tpl";

export class WhiteBoard {
    /**
     * 
     * @param {Model} model 
     * @param {HTMLElement} container 
     */
    constructor(model, container) {
        this._model = model;
        this._container = container;
        this._currentTransform = d3.zoomIdentity;
        this._hovered = null;
        this._zindex = 0;

        this._initBoard();
        this._initKeybindings();
        
        // @ts-ignore
        this._model.dataChanged.add((notes) => this._onDataChanged(notes));
    }

    highlightNotes(val) {
        this._whiteBoard.selectAll(".note")
            .classed("highlighted", d => val && (d.hasTheme(val) || d.hasPillar(val)))
    }

    _initBoard() {
        this._zoomBehaviour = d3.zoom()
            .on("zoom", () => this._onZoomed());

        this._dragBehaviour = d3.drag()
            .on("start", (d,i,g) => this._onDragStart(d,i,g))
            .on("drag", (d,i,g) => this._onDrag(d,i,g))
            .on("end", (d,i,g) => this._onDragEnd(d,i,g));

        this._whiteBoard = d3.select("#whiteboard");    
        this._whiteBoardContainer = d3.select("#whiteboard-container");
        this._whiteBoardContainer.call(this._zoomBehaviour);
    }

    _initKeybindings() {
        d3.select("BODY").on("keypress", () => this._onKeyPress());
    }

    _onKeyPress() {
        if(d3.event.keyCode < 48 || d3.event.keyCode > 54) return;
        
        const nColor = d3.event.keyCode - 48;
        d3.select(this._hovered)
            .classed("color0 color1 color2 color3 color4 color5 color6", false)
            .classed(`color${nColor}`, true)
            .each(d => d.color = `color${nColor}`);
        this._model._saveStorage();
    }

    _onZoomed() {
        const tr = this._currentTransform = d3.event.transform;
        const mouse = d3.mouse(this._whiteBoard.node());
        this._whiteBoard.style("transform", `translate(${tr.x}px ,${tr.y}px) scale(${tr.k})`);
        this._whiteBoard.style("transform-origin", `0 0`);
    }

    _onDragStart(d, i, g) {
        d3.select(g[i])
            .classed("dragging", true)
            .classed("new", false)
            .style("z-index", this._zindex++);
    }

    _onNoteOver(d, i, g) {
        this._hovered = g[i];
        d3.select(this._hovered).classed("hovered", true);
    }

    _onNoteOut(d, i, g) {
        d3.select(this._hovered).classed("hovered", false);
        this._hovered = null;
    }

    _onDrag(d, i, g) {
        d.x += d3.event.dx / this._currentTransform.k;
        d.y += d3.event.dy / this._currentTransform.k;
        d3.select(g[i])
            .style("top", d => `${d.y}px`)
            .style("left", d => `${d.x}px`);
    }

    _onDragEnd(d, i, g) {
        d3.select(g[i]).classed("dragging", false);
        this._model._saveStorage();
    }

    /**
     * 
     * @param {Note[]} notes 
     */
    _onDataChanged(notes) {
        this._notes = notes;

        const join = this._whiteBoard.selectAll(".note").data(notes, (n) => {
            return n.id;
        });

        join.enter()
                .append("div")
                .attr("class", d => d.getClasses())
                .classed("note", true)
                .call(this._dragBehaviour)
                .on("mouseover", (d,i,g) => this._onNoteOver(d,i,g))
                .on("mouseout", (d,i,g) => this._onNoteOut(d,i,g))
                .each(n => this._setInitialPosition(n))
            .merge(join)
                .style("top", d => `${d.y}px`)
                .style("left", d => `${d.x}px`)
                .style("backgound-color", n => n.color || "white")
                .html(d => noteTpl(d))

        join.exit().remove();
    }

    _setInitialPosition(note) {
        if (note.x && note.y) { return; }
        let x = -this._currentTransform.y / this._currentTransform.k;
        let y = -this._currentTransform.y / this._currentTransform.k;
        while (true) {
            const found = this._notes.find(n => n.x == x && n.y == y);
            if (!found) { 
                note.x = x;
                note.y = y;
                break;
            }
            x += 20;
            y += 20;
        }
    }

}