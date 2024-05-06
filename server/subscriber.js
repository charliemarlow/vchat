"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ioredis_1 = require("ioredis");
var Subscriber = /** @class */ (function () {
    function Subscriber() {
        this.redis = new ioredis_1.default();
        this.subscriptionCounts = new Map();
    }
    Subscriber.prototype.listen = function (callback) {
        this.redis.on('message', callback);
    };
    Subscriber.prototype.close = function () {
        this.redis.disconnect();
    };
    Subscriber.prototype.unsubscribe = function (channels) {
        var _this = this;
        var singletonChannels = channels.filter(function (channel) {
            return _this.subscriptionCounts.get(channel) === 1;
        });
        console.log('REDIS unsubscribe', singletonChannels);
        this.redis.unsubscribe(singletonChannels);
        channels.forEach(function (channel) {
            var count = _this.subscriptionCounts.get(channel) || 0;
            if (count > 1) {
                _this.subscriptionCounts.set(channel, count - 1);
            }
            else {
                _this.subscriptionCounts.delete(channel);
            }
        });
        console.log('PubSub subscription counts', this.subscriptionCounts);
    };
    Subscriber.prototype.subscribe = function (channels) {
        var _this = this;
        channels.forEach(function (channel) {
            var count = _this.subscriptionCounts.get(channel) || 0;
            if (count > 0) {
                _this.subscriptionCounts.set(channel, count + 1);
            }
            else {
                _this.subscriptionCounts.set(channel, 1);
                console.log('REDIS subscribe', channel);
                _this.redis.subscribe(channel);
            }
        });
        console.log('PubSub subscription counts', this.subscriptionCounts);
    };
    return Subscriber;
}());
exports.default = Subscriber;
