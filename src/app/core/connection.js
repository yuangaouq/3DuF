import Feature from './feature';
import paper from 'paper';
import Parameter from "./parameter";
import Params from "./params";
import ConnectionTarget from "./connectionTarget";

const Registry = require("./registry");


/**
 * This class contains the connection abstraction used in the interchange format and the
 * high level device model of the microfluidic.
 */
export default class Connection {
    constructor(type, params, name, mint, id = Feature.generateID()){
        this.__params = params;
        this.__name = name;
        this.__id = id;
        this.__type = type;
        this.__entity = mint;
        //This stores the features that are a part of the component
        this.__features = [];
        this.__nodes = [];
        //TODO: Need to figure out how to effectively search through these
        this.__bounds = null;
        this.__source = null;
        this.__sinks = [];
        this.__paths = [];
        this.__objects = [];
        this.__segments = [];
    }

    get features(){
        return this.__features;
    }

    /**
     * Generates a random id
     * @returns {String} Random ID string
     */
    static generateID() {
        return Registry.generateID();
    }

    /**
     * Sets the bounds i.e. the x,y position and the width and length of the component
     * @param bounds PaperJS Rectangle object associated with a Path.bounds property
     */
    setBounds(bounds){
        this.__bounds = bounds;
        let topleftpt = bounds.topLeft;
        this.__params.position = [topleftpt.x, topleftpt.y];
        this.__params.xspan = bounds.width;
        this.__params.yspan = bounds.height;
    }

    /**
     * Updates the parameters stored by the component
     * @param key
     * @param value
     */
    updateParameter(key, value){
        // this.__params.updateParameter(key, value);
        this.__params[key] = value;
        // this.updateView();
    }

    /**
     * Generates the object that needs to be serialzed into JSON for interchange format V1
     * @returns {{}} Object
     */
    toInterchangeV1(){
        let output = {};
        output.id = this.__id;
        output.name = this.__name;
        output.entity = this.__entity;
        output.source = this.__source;
        output.sinks = this.__sinks;
        output.params = this.__params.toJSON();
        return output;
    }

    /**
     * Returns the ID of the component
     * @returns {String|*}
     */
    getID(){
        return this.__id;
    }

    /**
     * Allows the user to set the name of the component
     * @param name
     */
    setName(name){
        console.log("test", name);
        this.__name = name;
    }

    /**
     * Returns the name of the component
     * @returns {String}
     */
    getName(){
        return this.__name;
    }

    /**
     * Gets the 3DuF Type of the component, this will soon be depreciated and merged with
     * the MINT references
     * @returns {*}
     */
    getType(){
        return this.__type;
    }

    /**
     * Returns the position of the component
     * @return {*|string}
     */
    getPosition(){
        return this.__params["position"].getValue();
    }

    /**
     * Returns the value of the parameter stored against the following key in teh component params
     * @param key
     * @returns {*}
     */
    getValue(key){
        try {
            return this.__params[key].getValue();
        } catch (err){
            throw new Error("Unable to get value for key: " + key);
        }
    }

    getFeatureIDs(){
        return this.__features;
    }

    /**
     * Not sure what this does
     * @param key
     * @returns {boolean}
     */
    hasDefaultParam(key){
        if (this.getDefaults().hasOwnProperty(key)) return true;
        else return false;
    }

    /**
     * Adds a feature that is associated with the component
     * @param featureID String id of the feature
     */
    addFeatureID(featureID){
        if(typeof featureID != 'string' && !(featureID instanceof String)){
            throw new Error("The reference object value can only be a string")
        }
        this.__features.push(featureID);
        //Now update bounds
        // this.__updateBounds();
    }

    /**
     * This method updates the bounds of the component
     * @private
     */
    __updateBounds() {
        console.log("test");
        let bounds = null;
        let feature = null;
        let renderedfeature = null;
        for(var i in this.__features){
            // gets teh feature defined by the id
            feature = Registry.currentDevice.getFeatureByID(this.__features[i]);
            console.log(feature);
            renderedfeature = FeatureRenderer2D.renderFeature(feature);
            console.log("rendered:");
            console.log(renderedfeature);
            if(bounds == null){
                bounds = renderedfeature.bounds;
            }else{
                bounds = bounds.unite(renderedfeature.bounds);
            }
        }
        this.__bounds = bounds;
    }

    /**
     * Rerturns the params associated with the component
     */
    getParams(){
        return this.__params;
    }

    /**
     * Sets the params associated with the component
     * @param params key -> Parameter Set
     */
    setParams(params){
        this.__params = params;
        //TODO: Modify all the associated Features
        for(let key in params){
            let value = params[key];
            for(let i in this.__features){
                let featureidtochange = this.__features[i];

                //Get the feature id and modify it
                let feature = Registry.currentDevice.getFeatureByID(featureidtochange);
                feature.updateParameter(key, value.getValue());
            }

        }
    }

    /**
     * Returns the list of waypoints associated with the connection
     * @return {*|void|string}
     */
    getWaypoints(){
        return this.__params["wayPoints"].getValue()
    }

    /**
     * Updates the segments of the connection
     * @param segments
     */
    updateSegments(segments){
        this.updateParameter('segments', new Parameter('SegmentArray', segments));
        for(let i in this.__features){
            let featureidtochange = this.__features[i];

            let feature = Registry.currentDevice.getFeatureByID(featureidtochange);
            // feature.updateParameter('position', center);
            feature.updateParameter('segments', segments);
        }

    }

    /**
     * Inserts the gap using the boundingbox
     * @param boundingbox
     */
    insertFeatureGap(boundingbox){
        //Convert Rectangle to Path.Rectangle
        boundingbox = new paper.Path.Rectangle(boundingbox);
        //Check which segment I need to break
        let segments = this.getValue("segments");
        for(let i in segments){
            let segment = segments[i];
            let line = new paper.Path.Line(new paper.Point(segment[0]), new paper.Point(segment[1]));
            let intersections = line.getIntersections(boundingbox);
            if(intersections.length === 2){
                let break1 = intersections[0].point;
                let break2 = intersections[1].point;
                let newsegs = this.__breakSegment(segment, break1, break2);
                segments.splice(i, 1, newsegs[0], newsegs[1]);
            }else if(intersections.length === 1){
                console.error("There's something funky going on with the intersection, only found 1 intersection");
            }
        }
        // console.log("raw new segments:", segments);
        this.updateSegments(segments);
    }

    /**
     * Breaks the segment at the 2 points given by the points
     * @param segment
     * @param break1
     * @param break2
     * @return {*[][][]}
     * @private
     */
    __breakSegment(segment, break1, break2){
        //Generate 2 segments from this 1 segemnt
        let p1 = new paper.Point(segment[0]);
        let p2 = new paper.Point(segment[1]);

        let segment1, segment2;

        //Find out if break1 is closer to p1 or p2
        if(p1.getDistance(break1) < p2.getDistance(break1)){
            //break1 is closer to p1 and break2 is closer to p2
            segment1 = [[p1.x, p1.y], [break1.x, break1.y]];
            segment2 = [[p2.x, p2.y], [break2.x, break2.y]];

        }else{
            //break1 is closer to p2 and break1 is closer to p1
            segment1 = [[p2.x, p2.y], [break1.x, break1.y]];
            segment2 = [[p1.x, p1.y], [break2.x, break2.y]];

        }

        return [segment1, segment2];
    }

    /**
     * This method is used to import the component from Interchange V1 JSON
     * @param json
     * @returns {*}
     */
    static fromInterchangeV1(json){
        // let set;
        // if (json.hasOwnProperty("set")) set = json.set;
        // else set = "Basic";
        // //TODO: This will have to change soon when the thing is updated
        // throw new Error("Need to implement Interchange V1 Import for component object");
        // //return Feature.makeFeature(json.macro, set, json.params, json.name, json.id, json.type);
        let name = json.name;
        let id = json.id;
        let entity = json.entity;
        let params = {};
        for(let key in json.params){
            console.log("key:", key, "value:", json.params[key]);
            let paramobject = Parameter.generateConnectionParameter(key, json.params[key]);
            params[key] = paramobject;
        }

        let paramstoadd = new Params(null, null, null, params);

        let connection = new Connection(entity, paramstoadd, name, entity, id);
        if(json.hasOwnProperty("source")){
            if(json.source != null && json.source != undefined){
                connection.setSource(json.source.component, json.source.port);
            }
        }
        if(json.hasOwnProperty("sinks")){
            if(json.sinks != null && json.sinks != undefined){
                for(let i in connection.__sinks){
                    let sink = connection.__sinks[i];
                    connection.addSink(sink.component, sink.port);
                }
            }
        }

        return connection;
    }


    /**
     * Goes through teh waypoints and generates the connection segments
     * @return {Array}
     */
    regenerateSegments() {
        let waypointscopy = this.getWaypoints();
        let ret = [];
        for(let i=0; i < waypointscopy.length - 1; i++){
            let segment = [waypointscopy[i], waypointscopy[i+1]];
            ret.push(segment);
        }
        this.updateSegments(ret);
    }

    /**
     * Allows the user to set the source of the connection
     * @param component
     * @param port
     */
    setSource(component, port){
        if(typeof component != 'string' && !(component instanceof String)){
            throw new Error("The reference object value can only be a string")
        }
        this.__source = new ConnectionTarget(component, port);
    }

    /**
     * Allows the user to add a sink to the connection
     * @param component
     * @param port
     */
    addSink(component, port) {
        if(typeof component != 'string' && !(component instanceof String)){
            throw new Error("The reference object value can only be a string")
        }
        this.__sinks.push(new ConnectionTarget(component, port));
    }

    /**
     * Adds a new connection target to either the source or the sinks of the connection object. Requires the user to pass
     * a ConnectionTarget Object or else it will throw an error.
     * @param connectiontarget
     */
    addConnectionTarget(connectiontarget){
        if(!(connectiontarget instanceof ConnectionTarget) || connectiontarget == null || connectiontarget == undefined) {
            throw new Error("Cannot add non-ConnectionTarget object as source or sink");
        }

        if(this.__source == null){
            this.__source = connectiontarget
        }else{
            //TODO: Check for duplicates - does it matter actually ?
            this.__sinks.push(connectiontarget);
        }
    }
}