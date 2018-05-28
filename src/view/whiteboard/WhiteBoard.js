import * as d3 from "d3";

import { Model } from "../../model/Model";
import { Note } from "../../model/Note";

import whiteboardTpl from "./whiteboard.tpl";
import "./whiteboard.css";

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

        this._initElements();
        this._initBoard();
        this._initKeybindings();

        this._model.dataChanged.add((notes) => this._onDataChanged(notes));
    }

    _initElements() {
        this._container.innerHTML = whiteboardTpl();
    }

    _initBoard() {
        this._zoomBehaviour = d3.zoom()
            .on("zoom", () => this._onZoomed());

        this._dragBehaviour = d3.drag()
            .on("start", (d,i,g) => this._onDragStart(d,i,g))
            .on("drag", (d,i,g) => this._onDrag(d,i,g))
            .on("end", (d,i,g) => this._onDragEnd(d,i,g))

        this._whiteBoardContainer = d3.select("#whiteboard-container");
        this._whiteBoardListener = d3.select("#whiteboard-listener");
        this._whiteBoard = d3.select("#whiteboard");

        this._whiteBoardListener.call(this._zoomBehaviour);
    }

    _initKeybindings() {
        d3.select("BODY").on("keypress", () => this._onKeyPress());
    }

    _onKeyPress() {
        if(d3.event.keyCode < 49 || d3.event.keyCode > 54) return;
        
        const nColor = d3.event.keyCode - 48;
        d3.select(this._hovered)
            .classed("color1 color2 color3 color4 color5 color6", false)
            .classed(`color${nColor}`, true)
            .each(d => d.color = `color${nColor}`);
        this._model._saveStorage();
    }

    _onZoomed() {
        const tr = this._currentTransform = d3.event.transform;
        const mouse = d3.mouse(this._whiteBoardListener.node());
        this._whiteBoard.style("transform-origin", `${(mouse[0] - tr.x) * tr.k}px ${(mouse[1] - tr.y) * tr.k}px`);
        this._whiteBoard.style("transform", `translate(${tr.x}px ,${tr.y}px) scale(${tr.k})`);
    }

    _onDragStart(d, i, g) {
        d3.event.sourceEvent.stopPropagation();
        d3.select(g[i]).classed("dragging", true);
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

        const join = this._whiteBoard.selectAll(".note").data(notes, (n) => {
            return n.id;
        });

        join.enter()
                .append("div")
                .attr("class", d => d.color || "")
                .classed("note", true)
                .call(this._dragBehaviour)
                .on("mouseover", (d,i,g) => this._hovered = g[i])
                .on("mouseout", (d,i,g) => this._hovered = null)
            .merge(join)
                .style("top", d => `${d.y}px`)
                .style("left", d => `${d.x}px`)
                .style("backgound-color", n => n.color || "white")
                .classed("hovered", d => this._hovered == d)
                .text((n) => n.text);

        join.exit().remove();
    }

}