"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ioredis_1 = require("ioredis");
var Subscriber = /** @class */ (function () {
    function Subscriber() {
        this.redis = new ioredis_1.default();
        this.socketIDsByChannel = new Map();
        this.socketByID = new Map();
    }
    Subscriber.prototype.listen = function (callback) {
        this.redis.on('message', callback);
    };
    Subscriber.prototype.close = function () {
        this.redis.disconnect();
    };
    Subscriber.prototype.socketsForChannel = function (channel) {
        var _this = this;
        var socketIDs = this.socketIDsByChannel.get(channel);
        var sockets = [];
        if (!socketIDs)
            return sockets;
        socketIDs.forEach(function (socketID) {
            var socket = _this.socketByID.get(socketID);
            if (socket)
                sockets.push(socket);
        });
        return sockets;
    };
    Subscriber.prototype.unsubscribe = function (channels, ws) {
        var _a;
        var _this = this;
        this.socketByID.delete(ws.id);
        var singletonChannels = [];
        channels.forEach(function (channel) {
            var sockets = _this.socketIDsByChannel.get(channel) || new Set();
            if (!sockets.has(ws.id))
                return;
            sockets.delete(ws.id);
            if (sockets.size > 0)
                return;
            singletonChannels.push(channel);
            _this.socketIDsByChannel.delete(channel);
        });
        console.log('After subscribe: subscription counts', this.socketIDsByChannel);
        if (singletonChannels.length === 0)
            return;
        console.log('REDIS unsubscribe', singletonChannels);
        (_a = this.redis).unsubscribe.apply(_a, singletonChannels);
    };
    Subscriber.prototype.subscribe = function (channels, ws) {
        var _a;
        var _this = this;
        this.socketByID.set(ws.id, ws);
        var toSubscribe = channels.filter(function (channel) {
            return !_this.socketIDsByChannel.has(channel);
        });
        channels.forEach(function (channel) {
            var socketSet = _this.socketIDsByChannel.get(channel) || new Set();
            socketSet.add(ws.id);
            _this.socketIDsByChannel.set(channel, socketSet);
        });
        console.log('After subscribe: subscription counts', this.socketIDsByChannel);
        if (toSubscribe.length === 0)
            return;
        console.log('REDIS subscribe', toSubscribe);
        (_a = this.redis).subscribe.apply(_a, toSubscribe);
    };
    return Subscriber;
}());
exports.default = Subscriber;
