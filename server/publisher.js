"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ioredis_1 = require("ioredis");
var Publisher = /** @class */ (function () {
    function Publisher() {
        this.redis = new ioredis_1.default();
    }
    Publisher.prototype.publish = function (channel, message) {
        this.redis.publish(channel, message);
    };
    Publisher.prototype.close = function () {
        this.redis.disconnect();
    };
    return Publisher;
}());
;
exports.default = new Publisher();
