const asyncHandler = require('express-async-handler')

const Message = require('../models/MessageModel')
const User = require('../models/userModel');
const Chat = require('../models/chatModel');

const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        console.log('Invalid data passed into request');
        return res.sendStatus(400);
    }

    var newMessage = {
        sender: req.user._id,
        content,
        chat: chatId
    }

    try {
        var message = await Message.create(newMessage);
        message = await message.populate('sender', "name photoUrl");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name email photoUrl"
        })
        await Chat.findByIdAndUpdate(chatId, {
            latestMessage: message
        })
        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message)
    }


}

)

const allMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId }).populate('sender', "name photoUrl email").populate("chat");
        res.json(messages)
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
}
)

module.exports = {
    sendMessage,
    allMessages
}