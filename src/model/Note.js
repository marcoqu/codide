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
    'Impatto e oggetti della ricerca': 'burning-issues',
    'Strategie di produzione scientifica e trasferimento conoscenza': 'produzione-scientifica',
    'Didattica innovativa': 'didattica-innovativa',
    'Internazionalizzazione. Progetti sfide prospettive': 'internazionalizzazione',
    'Bovisa distretto dell’innovazione': 'bovisa',
};

Note.PILLARS = {
    'Design for Advanced Manufacturing': 'p1',
    'Design for new business and entrepreneurship': 'p2',
    'Design for Social and Public Sector Innovation': 'p3',
    'Design for Cultural and Creative Industries': 'p4',
};
