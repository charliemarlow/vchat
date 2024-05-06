"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = require("ws");
var prisma_1 = require("./prisma");
var subscriber_1 = require("./subscriber");
var room_1 = require("./room");
var UserManager = /** @class */ (function () {
    function UserManager() {
        var _this = this;
        this.close = function () {
            _this.subscriber.close();
        };
        this.addUserSocket = function (userId, ws) { return __awaiter(_this, void 0, void 0, function () {
            var user, connectedSockets;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.user.findUnique({
                            where: { id: userId }
                        })];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            return [2 /*return*/, false];
                        }
                        connectedSockets = this.userToSocket.get(user.id) || [];
                        this.userToSocket.set(user.id, __spreadArray(__spreadArray([], connectedSockets, true), [ws], false));
                        this.channelsForUser(user.id).then(function (channelNames) {
                            _this.subscriber.subscribe(channelNames);
                        });
                        return [2 /*return*/, true];
                }
            });
        }); };
        this.removeUserSocket = function (userId, ws) { return __awaiter(_this, void 0, void 0, function () {
            var connectedSockets, remainingSockets;
            var _this = this;
            return __generator(this, function (_a) {
                connectedSockets = this.userToSocket.get(userId);
                if (!connectedSockets)
                    return [2 /*return*/];
                remainingSockets = connectedSockets.filter(function (socket) { return socket !== ws; });
                // if the removal is the last socket, remove the user from the map
                if (remainingSockets.length > 0) {
                    this.userToSocket.set(userId, remainingSockets);
                }
                else {
                    this.userToSocket.delete(userId);
                }
                this.channelsForUser(userId).then(function (channelNames) {
                    _this.subscriber.unsubscribe(channelNames);
                });
                return [2 /*return*/];
            });
        }); };
        this.channelsForUser = function (userId) { return __awaiter(_this, void 0, void 0, function () {
            var userInRooms, roomIds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.userInRoom.findMany({
                            where: { userId: userId },
                        })];
                    case 1:
                        userInRooms = _a.sent();
                        roomIds = userInRooms.map(function (uir) { return uir.roomId; });
                        return [2 /*return*/, roomIds.map(function (roomId) {
                                return "room-".concat(roomId);
                            })];
                }
            });
        }); };
        this.subscriber = new subscriber_1.default();
        this.userToSocket = new Map();
        this.subscriber.listen(this.distributeMessage.bind(this));
    }
    UserManager.prototype.distributeMessage = function (channel, message) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, roomId, id, room, msg;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = JSON.parse(message), roomId = _a.roomId, id = _a.id;
                        console.log('RECEIVED MESSAGE', roomId, id, channel);
                        room = new room_1.default(roomId);
                        return [4 /*yield*/, prisma_1.default.message.findUnique({
                                where: { id: id }
                            })];
                    case 1:
                        msg = _b.sent();
                        room.getUsers().then(function (users) {
                            users.forEach(function (user) {
                                var sockets = _this.userToSocket.get(user.id) || [];
                                sockets.forEach(function (socket) {
                                    if (socket.readyState === ws_1.WebSocket.OPEN) {
                                        socket.send(JSON.stringify(msg));
                                    }
                                });
                            });
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    return UserManager;
}());
exports.default = UserManager;
