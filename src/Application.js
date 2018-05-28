import { Model } from "./model/Model";
import { View } from "./view/View";

import "./styles.css";

const CONFIG = {
    sheetId: "2PACX-1vT9lXPCe-DKalObPwYCPOfO4d_W-MdDVA_gE_wH39k2JiNnVC_akmFMKWk8edSmoa-kX0XWjhS_z5gk",
};

export class Application {

    constructor() {

        this._model = new Model(CONFIG.sheetId);
        this._view = new View(this._model);

        this._model.loadData();
    }

}