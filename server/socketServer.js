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
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = require("ws");
var userManager_1 = require("./userManager");
var SocketServer = /** @class */ (function () {
    function SocketServer(port) {
        var _this = this;
        this.pingSockets = function () { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.wss.clients.forEach(function (ws) {
                    if (ws.isAlive === false) {
                        ws.terminate();
                        _this.userManager.removeUserSocket(ws.userId, ws);
                        return;
                    }
                    ws.isAlive = false;
                    ws.ping();
                });
                return [2 /*return*/];
            });
        }); };
        this.onSocketConnection = function (ws, req) { return __awaiter(_this, void 0, void 0, function () {
            var userId;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                userId = Number((_a = req.url) === null || _a === void 0 ? void 0 : _a.split('/')[1]);
                this.userManager.addUserSocket(userId, ws)
                    .then(function (success) {
                    if (success)
                        return;
                    ws.close();
                });
                ws.isAlive = true;
                ws.userId = userId;
                ws.on('error', console.error);
                ws.on('message', function (data) {
                    console.log('Unexpectedly received: %s for user %s', data, userId);
                });
                ws.on('close', function () {
                    console.log('User %s disconnected', userId);
                    _this.userManager.removeUserSocket(userId, ws);
                });
                ws.on('pong', function () {
                    ws.isAlive = true;
                });
                return [2 /*return*/];
            });
        }); };
        this.wss = new ws_1.WebSocketServer({ port: port });
        this.userManager = new userManager_1.default();
        this.wss.on('connection', this.onSocketConnection.bind(this));
        this.pingInterval = setInterval(this.pingSockets.bind(this), 30000);
    }
    SocketServer.prototype.close = function () {
        this.wss.close();
        this.userManager.close();
        clearInterval(this.pingInterval);
    };
    return SocketServer;
}());
exports.default = SocketServer;
