"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var room_1 = require("../../room");
var router = (0, express_1.Router)({ mergeParams: true });
router.get('/', function (req, res) {
    var roomId = req.params.roomId;
    var room = new room_1.default(parseInt(roomId));
    room.getMessages().then(function (messages) {
        res.json(messages);
    });
});
router.post('/', function (req, res) {
    var roomId = req.params.roomId;
    var _a = req.body, userId = _a.userId, text = _a.text;
    if (!userId || !text) {
        res.status(400).json({ error: 'userId and text are required' });
        return;
    }
    var room = new room_1.default(parseInt(roomId));
    room.sendMessage(parseInt(userId), text).then(function () {
        res.json({ status: 'ok' });
    });
});
exports.default = router;
