import PositionTool from "./positionTool";

const Registry = require("../../core/registry");
import Feature from '../../core/feature';

export default class MultilayerPositionTool extends PositionTool{
    constructor(typeString, setString){
        super(typeString, setString);
    }

    createNewFeature(point){
        let featureIDs = [];
        let currentlevel = Math.floor(Registry.currentDevice.layers.indexOf(Registry.currentLayer)/3);
        let flowlayer = Registry.currentDevice.layers[currentlevel * 3 + 0];
        let controllayer = Registry.currentDevice.layers[currentlevel * 3 + 1];

        let newFeature = Feature.makeFeature(this.typeString, this.setString, {
            "position": PositionTool.getTarget(point)
        });
        this.currentFeatureID = newFeature.getID();
        flowlayer.addFeature(newFeature);

        featureIDs.push(newFeature.getID());

        let params_to_copy = newFeature.getParams();

        let newtypestring = this.typeString + "_control";
        let paramstoadd = newFeature.getParams();
        newFeature = Feature.makeFeature(newtypestring, this.setString, {
            "position": PositionTool.getTarget(point)
        });
        newFeature.setParams(paramstoadd);

        this.currentFeatureID = newFeature.getID();
        controllayer.addFeature(newFeature);

        featureIDs.push(newFeature.getID());

        super.createNewComponent(this.typeString, params_to_copy, featureIDs );
        Registry.viewManager.saveDeviceState();

    }

    showTarget(){
        let target = PositionTool.getTarget(this.lastPoint);
        Registry.viewManager.updateTarget(this.typeString, this.setString, target);
    }
}

