import Template from "./template";
import paper from "paper";

export  default class Channel extends Template{
    constructor(){
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            "start": "Point",
            "end": "Point"
        };

        this.__heritable = {
            "channelWidth": "Float",
            "height": "Float"
        };

        this.__units = {
            "channelWidth": "&mu;m",
            "height": "&mu;m"
        };

        this.__minimum = {
            "channelWidth": 3,
            "height": 10,
        };

        this.__maximum = {
            "channelWidth": 2000,
            "height": 1200,
        };

        this.__placementTool = "DragTool";

        this.__toolParams = {
            start: "start",
            end: "end"
        };

    }

    render2D(key, params) {
        //Regardless of the key...
        let start = params["start"];
        let end = params["end"];
        let color = params["color"];
        let width = params["width"];
        let baseColor = params["baseColor"];
        let startPoint = new paper.Point(start[0], start[1]);
        let endPoint = new paper.Point(end[0], end[1]);
        let vec = endPoint.subtract(startPoint);
        let rec = paper.Path.Rectangle({
            size: [vec.length, width],
            point: start,
            //  radius: width/2,
            fillColor: color,
            strokeWidth: 0
        });
        rec.translate([0, -width / 2]);
        rec.rotate(vec.angle, start);
        return rec;

    }

    render2DTarget(key, params){
        let render = this.render2D(key, params);
        render.fillColor.alpha = 0.5;
    }
}