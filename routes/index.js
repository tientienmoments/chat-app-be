var express = require('express');
var router = express.Router();
const Room = require("../models/room")
/* GET home page. */
router.get('/rooms', async function(req, res, next) {
  let rooms = [{room: "HCMC"}, {room: "Vietnam"}, {room: "Aboard"}]
  let result = await Room.insertMany(rooms)
  res.send(result)
  
});

module.exports = router;
