"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ItemTypes_1 = require("../models/ItemTypes");
var _ = __importStar(require("lodash"));
var GopherCore = /** @class */ (function () {
    function GopherCore() {
    }
    GopherCore.prototype.generateGopherMapFromObject = function (object) {
        return Object.keys(object).map(function (key) {
            return {
                description: key,
                handler: key,
                type: ItemTypes_1.ItemTypes.Menu
            };
        });
    };
    GopherCore.prototype.generateGopherMapFromJson = function (_a) {
        var customHandler = _a.customHandler, json = _a.json, selector = _a.selector;
        // no selector, return root level map of the json.
        if (!selector) {
            var gopherMap = this.generateGopherMapFromObject(json);
            if (!customHandler) {
                return gopherMap;
            }
            return gopherMap.map(function (x) { return (__assign({}, x, { handler: customHandler + x.handler })); });
        }
        var property = _.get(json, selector);
        // it's objectlike, for json this means it's either an array or an object, return a directory
        if (_.isObject(property)) {
            var menu = this.generateGopherMapFromObject(property).map(function (x) { return (__assign({}, x, { handler: selector + "." + x.handler })); });
            if (customHandler) {
                menu = menu.map(function (x) { return (__assign({}, x, { handler: customHandler + x.handler })); });
            }
            return menu;
        }
        // it's a property on the object, return the contents directly
        return [this.generateGopherInfoMessage(property)];
    };
    /**
     * Transforms input to gopher.
     *
     * @param dir
     */
    GopherCore.prototype.transformInformationToGopherText = function (preGopher) {
        var gopherText = preGopher.reduce(function (gopher, entry) {
            if (entry.type === ItemTypes_1.ItemTypes.File && entry.isRaw) {
                return entry.description;
            }
            return (gopher += "" + entry.type + entry.description + "\t" + entry.handler + "\t" + entry.host + "\t" + entry.port + "\r\n");
        }, "") + "."; // . is the termination character.
        return gopherText;
    };
    /**
     * Tests if the input is an empty newline or (\r\n)
     * @param input
     */
    GopherCore.prototype.isEmptyCRLF = function (input) {
        return input === "\r\n";
    };
    GopherCore.prototype.generateEmptyGopherLine = function () {
        return {
            description: "",
            handler: "",
            type: ItemTypes_1.ItemTypes.Info,
            host: "",
            port: ""
        };
    };
    GopherCore.prototype.generateGopherInfoMessage = function (message) {
        return {
            description: message,
            handler: "",
            type: ItemTypes_1.ItemTypes.Info,
            host: "",
            port: ""
        };
    };
    GopherCore.prototype.generateGopherFromAscii = function (ascii) {
        var lines = ascii.split("\n");
        var preGopher = lines.map(this.generateGopherInfoMessage);
        return preGopher;
    };
    return GopherCore;
}());
exports.GopherCore = GopherCore;
