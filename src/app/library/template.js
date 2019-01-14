export default class Template {
    constructor(){
        this.__unique = null;
        this.__heritable = null;
        this.__defaults = null;
        this.__minimum = null;
        this.__maximum = null;
        this.__units = null;
        this.__placementTool = null;
        this.__toolParams = null;//{ position: "position" };
        this.__setupDefinitions();
    }

    get placementTool(){
        if(this.__placementTool == null){
            throw new Error("placementtool cannot be null instantiate in the __setupDefinitions");
        }

        return this.__placementTool;
    }

    get toolParams(){
        if(this.__toolParams == null){
            throw new Error("toolparams cannot be null instantiate in the __setupDefinitions");
        }

        return this.__toolParams;
    }

    get defaults(){
        if(this.__defaults == null){
            throw new Error("defaults cannot be null instantiate in the __setupDefinitions");
        }

        return this.__defaults;
    }

    get minimum(){
        if(this.__minimum == null){
            throw new Error("minimum cannot be null instantiate in the __setupDefinitions");
        }

        return this.__minimum;
    }

    get maximum(){
        if(this.__maximum == null){
            throw new Error("maximum cannot be null instantiate in the __setupDefinitions");
        }

        return this.__maximum;
    }

    get units(){
        if(this.__units == null){
            throw new Error("units cannot be null instantiate in the __setupDefinitions");
        }

        return this.__units;
    }

    get unique(){
        if(this.__unique == null){
            throw new Error("unique cannot be null instantiate in the __setupDefinitions");
        }

        return this.__unique;
    }

    get heritable(){
        if(this.__heritable == null){
            throw new Error("Heritable cannot be null instantiate in the __setupDefinitions");
        }
        return this.__heritable;
    }

    __setupDefinitions() {
        /*
        Check https://github.com/CIDARLAB/3DuF/wiki/Adding-new-components-v2 for more example data
         */
        throw new  Error ("User needs to provide method for component definition, look at examples");
    }

    /**
     * Replacing /src/app/view/render2D/primitiveSets2D/basic2D
     */

    /**
     * Returns the paperjs render for a given key (can be control/flow or anything user defined key that for future
     * compatibility.
     * @param key
     */
    render2D(key, params){
        throw new  Error ("User needs to provide method for component definition, look at examples");
    }
}