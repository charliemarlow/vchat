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
var express = require("express");
var cors = require("cors");
var path = require("path");
var socketServer_1 = require("./socketServer");
var users_1 = require("./routes/users");
var rooms_1 = require("./routes/rooms");
var prisma_1 = require("./prisma");
var publisher_1 = require("./publisher");
var app = express();
// middleware
var corsOptions = {
    origin: ['http://localhost:5173'],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "dist")));
// routes
app.get('/', function (_, res) {
    res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});
app.use('/users', users_1.default);
app.use('/rooms', rooms_1.default);
// listen for API and WebSocket connections
var apiPort = 3000;
var socketPort = 8080;
var wss = new socketServer_1.default(socketPort);
var server = app.listen(apiPort, function () {
    console.log("Server is running on http://localhost:".concat(apiPort));
});
// gracefully shut down the server
var shutDown = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('Shutting down server');
                return [4 /*yield*/, prisma_1.default.$disconnect()];
            case 1:
                _a.sent();
                publisher_1.default.close();
                wss.close();
                server.close(function (err) {
                    console.log('Server is shut down', err);
                    process.exit(err ? 1 : 0);
                });
                setTimeout(function () {
                    console.error('Could not close connections in time, forcefully shutting down');
                    process.exit(1);
                }, 5000); // 5 seconds
                return [2 /*return*/];
        }
    });
}); };
process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);
