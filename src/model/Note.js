export class Note {

    constructor(id, obj) {
        this.id =id;

        this.text = obj["Il tuo contributo"];
        this._author = obj["Autore"];
        this._pillars = obj["Pillar tematici di riferimento"].split(", ").map(s => Note.PILLARS[s]);
        this._themes = obj["Ambiti strategici di riferimento"].split(", ").map(s => Note.THEMES[s]);
        this._timestamp = obj["Timestamp"];

        this.x = obj.x || 0;
        this.y = obj.y || 0;
        this.color = obj.color;
        this.new = !(obj.x || obj.y || obj.color);
    }

    getClasses() {
        return `${this._pillars.join(" ")} ${this._themes.join(" ")} ${this.color || ""} ${this.new ? "new" : ""}`;
    }

}

Note.THEMES = {
    "“Burning issues” della ricerca": "burning-issues", 
    "Produzione scientifica e valutazione": "produzione-scientifica", 
    "Didattica innovativa": "didattica-innovativa", 
    "Disseminazione e trasferimento conoscenza": "disseminazione", 
    "Internazionalizzazione": "internazionalizzazione", 
    "Bovisa distretto dell’innovazione": "Bovisa", 
}

Note.PILLARS = {
    "Design for advanced manufacturing": "p1",
    "Design for new business and entrepreneurship": "p2",
    "Design for social and public-sector innovation": "p3",
    "Design for cultural and creative industries": "p4",
}