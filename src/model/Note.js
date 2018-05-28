export class Note {

    constructor(id, obj) {
        this.id =id;

        this.text = obj["Il tuo contributo"];
        this._author = obj["Autore"];
        this._pillars = obj["Pillar tematici di riferimento"].split(", ");
        this._themes = obj["Ambiti strategici di riferimento"].split(", ");
        this._timestamp = obj["Timestamp"];

        this.x = obj.x || 0;
        this.y = obj.y || 0;
        this.color = obj.color;
    }

}