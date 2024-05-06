"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var room_1 = require("../../room");
var router = (0, express_1.Router)({ mergeParams: true });
router.get('/', function (req, res) {
    var roomId = req.params.roomId;
    if (!roomId) {
        res.status(400).json({ error: 'roomId is required' });
        return;
    }
    var room = new room_1.default(parseInt(roomId));
    room.getUsers().then(function (users) {
        res.json(users);
    });
});
// Add a user to a room
router.put('/:userId', function (req, res) {
    var _a = req.params, roomId = _a.roomId, userId = _a.userId;
    var room = new room_1.default(parseInt(roomId));
    room.addUser(parseInt(userId)).then(function () {
        res.json({ status: 'ok' });
    });
});
router.delete('/:userId', function (req, res) {
    var _a = req.params, roomId = _a.roomId, userId = _a.userId;
    var room = new room_1.default(parseInt(roomId));
    room.removeUser(parseInt(userId)).then(function () {
        res.json({ status: 'ok' });
    });
});
exports.default = router;
