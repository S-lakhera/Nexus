import User from "../models/user.model.js";
import jwt from 'jsonwebtoken'
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";

// @description     Register new user
// @route           POST /api/user
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, pic } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please enter all required fields" });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({
            name,
            email,
            password,
            pic,
        });

        res.cookie("jwt", generateRefreshToken(user._id), {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                pic: user.pic,
                accessToken: generateAccessToken(user._id)
            });
        } else {
            res.status(400).json({ message: "Failed to create the user" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @description     Login the user & get token
// @route           POST /api/auth/login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "Email not found."
            })
        }

        res.cookie("jwt", generateRefreshToken(user._id), {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                pic: user.pic,
                accessToken: generateAccessToken(user._id),
            });
        } else {
            res.status(401).json({ message: "Invalid Email or Password" });
        }
    } catch (error) {
        console.log(error);

        res.status(500).json({ message: error.message });
    }
};

// @description     Get or Search all users (for starting a chat)
// @route           GET /api/auth?search=john
export const allUsers = async (req, res) => {
    try {
        const keyword = req.query.search
            ? {
                $or: [
                    { name: { $regex: req.query.search, $options: "i" } },
                    { email: { $regex: req.query.search, $options: "i" } },
                ],
            }
            : {};

        // Find all users matching the search, except the currently logged-in user
        const users = await User.find(keyword).find({ _id: { $ne: req.user._id } }).select("-password");
        res.send(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @description     Refresh Access Token
// @route           POST /api/auth/refresh
export const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ message: "Not authorized, no refresh token" });
        }

        // Verify the refresh token
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

        // Issue a new Access Token
        const newAccessToken = generateAccessToken(decoded.id);

        res.json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};

// @description     Logout user / clear cookie
// @route           POST /api/auth/logout
export const logoutUser = (req, res) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: "Logged out successfully" });
};