export default class Note {

    constructor(id, obj) {
        this.id = id;

        this.text = obj['Il tuo contributo'];
        this.author = obj.Autore;

        this._pillars = obj['Pillar tematici di riferimento'].split(', ').map(s => Note.PILLARS[s]);
        this._themes = obj['Ambiti strategici di riferimento'].split(', ').map(s => Note.THEMES[s]);
        this._timestamp = obj.Timestamp;

        this.x = obj.x || 0;
        this.y = obj.y || 0;
        this.color = obj.color;
        this.new = !(obj.x || obj.y || obj.color);
    }

    getInitials() {
        return this.author
            .split(' ')
            .map(w => `${w.charAt(0).toUpperCase()}.`)
            .join(' ');
    }

    getClasses() {
        const pillars = this._pillars.join(' ');
        const themes = this._themes.join(' ');
        const color = this.color || '';
        const newNote = this.new ? 'new' : '';
        return `${pillars} ${themes} ${color} ${newNote}`;
    }

    hasTheme(theme) {
        return this._themes.includes(theme);
    }

    hasPillar(pillar) {
        return this._pillars.includes(pillar);
    }

    hasPosition() {
        return this.x && this.y;
    }

    clearMergedData() {
        this.x = undefined;
        this.y = undefined;
        this.color = undefined;
    }

}

Note.THEMES = {
    '“Burning issues” della ricerca': 'burning-issues',
    'Produzione scientifica e valutazione': 'produzione-scientifica',
    'Didattica innovativa': 'didattica-innovativa',
    'Disseminazione e trasferimento conoscenza': 'disseminazione',
    'Internazionalizzazione': 'internazionalizzazione',
    'Bovisa distretto dell’innovazione': 'Bovisa',
};

Note.PILLARS = {
    'Design for advanced manufacturing': 'p1',
    'Design for new business and entrepreneurship': 'p2',
    'Design for social and public-sector innovation': 'p3',
    'Design for cultural and creative industries': 'p4',
};
