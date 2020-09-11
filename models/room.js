const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    room: {
        type: String,
        required:true,
        unique: true,
        trim:true
    }
    },{
        timestamp: true,
        toJSON:{virtuals: true},
        toObject:{virtuals:true}
    })
    // members:[]
    
Schema.virtual("members", {
    ref: 'User',
    localField: '_id',   //room id
    foreignField: 'room',   //= User.room
    
})



module.exports = mongoose.model("Room", Schema)