const Server = require("../models/server");
const Chat = require("../models/chat");
const Room = require("../models/room");
const User = require("../models/user");


module.exports = function (io) {
    io.on("connection", async function (socket) {
        //vote
        socket.on("vote", (option) => {
            io.emit("receiveVote", option);
        });
        // fetch rooms
        socket.emit("rooms", await Room.find().populate("members"))


        // logins
        socket.on("login", async (name, res) => {
            const user = await Server.login(name, socket.id)
            return res(user)
        })

        // join room
        socket.on("joinRoom", async (roomID, res) => {
            try {
                // check user
                const user = await Server.checkUser(socket.id);

                // join room (DB)
                const room = await user.joinRoom(roomID);

                // subscribe user to the room
                socket.join(room._id);
                // send notification message;

                console.log("Hello ", user.user);
                //luu ten login vao database va hien thi ben duoi
                const welcomeMessage = {
                    user:
                    {
                        name: "System"
                    },
                    chat: `Wellcome ${user.user.name} to room ${user.user.room.room}`,
                };
                socket.to(room._id).broadcast.emit('messages', welcomeMessage)

                // send notification message;
                // io.to(room._id).emit('messages', { user: "system", message: `Welcome ${user.user.name} to room ${room.room}` })

                const chatHistory = await Chat.find({ room: room._id }).populate("user").sort("-createdAt").limit(20)

                chatHistory.unshift(welcomeMessage);

                //rooms
                const rooms = await Room.find().populate("members")
                console.log("check rooms", rooms)
                io.emit("rooms", rooms)
                // return room info to client 
                return res({ status: "ok", data: { room: room, history: chatHistory } })
            } catch (err) {
                console.log(err)
                return res({ status: "error", message: err.message })
            }
        })





        // chat
        socket.on("sendMessage", async function (message) {
            const user = await Server.checkUser(socket.id);
            console.log("in message ", message);
            const chat = await user.chat(message)
            io.to(user.user.room._id).emit("messages", chat)
        })





        // leave room 
        socket.on("leaveRoom", async function (roomID) {

            // check user
            const user = await Server.checkUser(socket.id);
            console.log("check user", user.user)

            socket.leave(roomID);
            // leave room (DB)
            const leaveMessage = {
                user:
                {
                    name: "System"
                },
                chat: `${user.user.name} left room ${user.user.room.room}`,
            };
            io.to(user.user.room._id).emit('messages', leaveMessage)

            const chatHistory = await Chat.find({ room: room._id }).populate("user").sort("-createdAt").limit(20)

            chatHistory.unshift(leaveMessage);
            return res({ status: "ok", data: { room: room, history: chatHistory } })

        })




        socket.on("disconnect", async function (name, roomID, res) {

            // check user
            const user = await Server.checkUser(socket.id);
            console.log("check user", user)
            // join room (DB)



            // send notification message;
            socket.to(user.user.room._id).broadcast.emit('messages', {
                user:
                {
                    name: "System"
                },
                chat: `${user.user.name} has been left ${user.user.room.room}`
            })



            socket.leave(user.user.room);

            user.user.room = null;
            await user.user.save();
            const rooms = await Room.find().populate("members")


            io.emit("rooms", rooms)
        })
    });
}