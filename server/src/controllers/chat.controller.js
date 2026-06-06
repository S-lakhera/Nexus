import Chat from "../models/chat.model.js";
import User from "../models/user.model.js"

// @description     Create or fetch One to One Chat
// @route           POST /api/chat
export const accessChat = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: "UserId param not sent with request" });
    }

    // 1. Check if a 1-on-1 chat already exists between the logged-in user and the target user
    let isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ],
    })
        .populate("users", "-password")
        .populate("latestMessage");

    // Populate the sender of the latest message
    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email",
    });

    if (isChat.length > 0) {
        res.send(isChat[0]);
    } else {
        // 2. If it doesn't exist, create a new chat data object
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        };

        try {
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
                "users",
                "-password"
            );
            res.status(200).json(FullChat);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

// @description     Fetch all chats for a user
// @route           GET /api/chat
export const fetchChats = async (req, res) => {
    try {
        // Find all chats where the logged-in user is part of the users array
        let results = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 });

        results = await User.populate(results, {
            path: "latestMessage.sender",
            select: "name pic email",
        });

        res.status(200).send(results);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @description     Create New Group Chat
// @route           POST /api/chat/group
export const createGroupChat = async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please fill all the fields" });
    }

    let users = req.body.users;

    // Sometimes the frontend sends a stringified array, this ensures we parse it safely
    if (typeof users === "string") {
        users = JSON.parse(users);
    }

    if (users.length < 2) {
        return res.status(400).send("More than 2 users are required to form a group chat");
    }

    // Add the currently logged-in user (the creator) to the group
    users.push(req.user._id);

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user._id,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @description     Rename Group
// @route           PUT /api/chat/rename
export const renameGroup = async (req, res) => {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { chatName: chatName },
        { returnDocument: 'after' } // Returns the updated document instead of the old one
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!updatedChat) {
        res.status(404).json({ message: "Chat Not Found" });
    } else {
        res.json(updatedChat);
    }
};

// @description     Remove user from Group
// @route           PUT /api/chat/groupremove
export const removeFromGroup = async (req, res) => {
    const { chatId, userId } = req.body;

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        { $pull: { users: userId } }, // $pull removes the ID from the array
        { returnDocument: 'after' }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!removed) {
        res.status(404).json({ message: "Chat Not Found" });
    } else {
        res.json(removed);
    }
};

// @description     Add user to Group
// @route           PUT /api/chat/groupadd
export const addToGroup = async (req, res) => {
    const { chatId, userId } = req.body;

    const added = await Chat.findByIdAndUpdate(
        chatId,
        { $push: { users: userId } }, // $push adds the ID to the array
        { returnDocument: 'after' }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!added) {
        res.status(404).json({ message: "Chat Not Found" });
    } else {
        res.json(added);
    }
};