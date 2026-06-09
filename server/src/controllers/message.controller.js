import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Chat from "../models/chat.model.js";

// @description     Send a new message
// @route           POST /api/message
export const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.status(400).json({ message: "Invalid data passed into request" });
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    // 1. Create the new message in the database
    var message = await Message.create(newMessage);

    // 2. Populate the sender and chat details so the frontend has everything it needs
    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    // 3. Update the latestMessage property in the Chat model
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @description     Get all messages for a specific chat
// @route           GET /api/message/:chatId
export const allMessages = async (req, res) => {
  try {
    // Find all messages that belong to the specific chat ID
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @description     Mark a message as read by the current user
// @route           PUT /api/message/read
export const markMessageAsRead = async (req, res) => {
  const { messageId } = req.body;

  if (!messageId) {
    return res.status(400).json({ message: "messageId required" });
  }

  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { readBy: req.user._id } },
      { "findOneAndUpdate": 'after' }
    )
      .populate("sender", "name pic email")
      .populate("chat")
      .populate("readBy", "name pic email");

    res.json(updatedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};