import { zoomIdentity, zoom } from 'd3-zoom';
import { drag } from 'd3-drag';
import { event, select } from 'd3-selection';

// @ts-ignore
import noteTpl from './note.tpl';

export default class WhiteBoard {

    constructor(model, container, config) {
        this._model = model;
        this._container = container;

        this._snap = config.snap || WhiteBoard.SNAP;
        this._zoomThreshold = config.zoomThreshold || WhiteBoard.ZOOM_THRESHOLD;
        this._scaleBorder = config.scaleBorder || WhiteBoard.SCALE_BORDER;

        this._currentTr = zoomIdentity;
        this._hoveredNote = null;
        this._highestZIndex = 1;

        this._init();

        this._model.dataChanged.add(notes => this._onDataChanged(notes));
    }

    highlightCategory(category) {
        if (!category) {
            this._whiteBoard.selectAll('.highlighted').classed('highlighted', false);
            this._whiteBoard.selectAll('.color').classed('color', false);
            return;
        }

        if (!this._notesSel) { return; }
        this._notesSel
            .classed('highlighted', d => category && (d.hasTheme(category) || d.hasPillar(category)))
            .select(`.${category}`).classed('color', true);
    }

    zoomToBounds() {
        const bounds = this._getWhiteBoardBounds();
        const containerBounds = this._whiteBoardContainer.node().getBoundingClientRect();

        const dx = bounds.width / this._currentTr.k;
        const dy = bounds.height / this._currentTr.k;
        const x = (bounds.left - this._currentTr.x) / this._currentTr.k;
        const y = (bounds.top - this._currentTr.y) / this._currentTr.k;

        const scale = Math.min(containerBounds.width / dx, containerBounds.height / dy);
        const translate = [
            (-x * scale) + ((containerBounds.width - (dx * scale)) / 2),
            (-y * scale) + ((containerBounds.height - (dy * scale)) / 2),
        ];

        this._currentTr = zoomIdentity.translate(translate[0], translate[1]).scale(scale);
        this._whiteBoardContainer
            .transition()
            .duration(500)
            .call(this._zoomBehaviour.transform, this._currentTr);
    }

    // INIT

    _init() {
        this._whiteBoard = this._container.select('#whiteboard');
        this._whiteBoardContainer = this._container.select('#whiteboard-container');

        this._zoomBehaviour = zoom()
            .on('zoom', () => this._onZoomed());

        this._dragBehaviour = drag()
            .on('start', (d, i, g) => this._onDragStart(d, i, g))
            .on('drag', (d, i, g) => this._onDrag(d, i, g))
            .on('end', (d, i, g) => this._onDragEnd(d, i, g));

        this._whiteBoardContainer.call(this._zoomBehaviour);
        this._container.on('keypress', () => this._onKeyPress());
    }

    // USER HANDLERS

    _onKeyPress() {
        if (event.charCode < 48 || event.charCode > 55) { return; }
        const color = `color${event.charCode - 48}`;

        select(this._hoveredNote)
            .each((d) => { d.color = color; })
            .each((d, i, g) => this._setColor(d, i, g));

        this._model.saveLocalStorage();
    }

    _onZoomed() {
        // eslint-disable-next-line no-multi-assign
        const tr = this._currentTr = event.transform;
        this._whiteBoard
            .style('transform', `translate(${tr.x}px ,${tr.y}px) scale(${tr.k})`)
            .style('transform-origin', '0 0')
            .classed('low_zoom', tr.k < this._zoomThreshold);
        if (!this._scaleBorder) { this._notesSel.style('border-width', `${5 / tr.k}px`); }
    }

    _onDragStart(d, i, g) {
        select(g[i])
            .classed('dragging', true)
            .classed('new', false)
            .style('z-index', this._highestZIndex);
        this._highestZIndex += 1;
    }

    _onDrag(d, i, g) {
        d.x += event.dx / this._currentTr.k;
        d.y += event.dy / this._currentTr.k;
        const x = Math.floor(d.x / this._snap[0]) * this._snap[0];
        const y = Math.floor(d.y / this._snap[1]) * this._snap[1];
        select(g[i])
            .style('top', () => `${y}px`)
            .style('left', () => `${x}px`);
    }

    _onDragEnd(d, i, g) {
        select(g[i]).classed('dragging', false);
        this._model.saveLocalStorage();
    }

    _onNoteOver(d, i, g) {
        this._hoveredNote = g[i];
        select(this._hoveredNote).classed('hovered', true);
    }

    _onNoteOut() {
        select(this._hoveredNote).classed('hovered', false);
        this._hoveredNote = null;
    }

    // DATA HANDLERS

    _onDataChanged(notes) {
        this._notes = notes;

        const dataJoin = this._whiteBoard
            .selectAll('.note')
            .data(notes, n => n.id);

        this._notesSel = dataJoin.enter()
            .append('div')
            .attr('class', d => d.getClasses())
            .classed('note', true)
            .call(this._dragBehaviour)
            .on('mouseover', (d, i, g) => this._onNoteOver(d, i, g))
            .on('mouseout', () => this._onNoteOut())

            .merge(dataJoin)
            .each((d, i, g) => {
                if (d.hasPosition()) { return; }
                this._setInitialPosition(d);
                select(g[i]).style('z-index', null);
            })
            .style('top', d => `${d.y}px`)
            .style('left', d => `${d.x}px`)
            .each((d, i, g) => this._setColor(d, i, g))
            .html(d => noteTpl(d));

        dataJoin.exit().remove();
    }

    // HELPERS

    _setInitialPosition(note) {
        let x = (window.innerWidth / 2) + (-this._currentTr.x / this._currentTr.k) - 155;
        let y = (window.innerHeight / 2) - (this._currentTr.y / this._currentTr.k);
        while (true) {
            // eslint-disable-next-line no-loop-func
            const found = this._notes.find(n => n.x === x && n.y === y);
            if (!found) {
                note.x = x;
                note.y = y;
                break;
            }
            x += 20;
            y += 20;
        }
    }

    _setColor(d, i, g) {
        select(g[i])
            .classed('color0 color1 color2 color3 color4 color5 color6 color7', false)
            .classed(d.color || '', true);
    }

    _getWhiteBoardBounds() {
        const bounds = {
            left: Infinity,
            right: -Infinity,
            top: Infinity,
            bottom: -Infinity,
            height: undefined,
            width: undefined,
        };
        this._whiteBoard.selectAll('.note').each((d, i, g) => {
            const bb = g[i].getBoundingClientRect();
            bounds.left = bounds.left < bb.left ? bounds.left : bb.left;
            bounds.right = bounds.right > bb.right ? bounds.right : bb.right;
            bounds.top = bounds.top < bb.top ? bounds.top : bb.top;
            bounds.bottom = bounds.bottom > bb.bottom ? bounds.bottom : bb.bottom;
        });
        bounds.height = bounds.bottom - bounds.top;
        bounds.width = bounds.right - bounds.left;
        return bounds;
    }

}

WhiteBoard.ZOOM_THRESHOLD = 0.3;
WhiteBoard.SNAP = [1, 1];
WhiteBoard.SCALE_BORDER = true;
