import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import ConnectionRequest from "../models/connection.model.js";
import Comment from "../models/comments.model.js";
import Post from "../models/posts.model.js";


import bcrypt from "bcrypt";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";


const convertUserFataTOPDF = async (userData) => {
    const doc = new PDFDocument();

    const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
    const stream = fs.createWriteStream("uploads/" + outputPath);

    doc.pipe(stream);

    doc.image(`uploads/${userData.userId.profilePicture}`, { align: "center", width: 150, height: 150 });
    doc.fontSize(14).text(`Name: ${userData.userId.name}`);
    doc.fontSize(14).text(`Username: ${userData.userId.username}`);
    doc.fontSize(14).text(`Email: ${userData.userId.email}`);
    doc.fontSize(14).text(`Bio: ${userData.bio}`);
    doc.fontSize(14).text(`Current Position: ${userData.currentPost}`);

    doc.fontSize(14).text("Past Work:");
    userData.pastWork.forEach((work, index) => {
        doc.fontSize(12).text(`Company: ${work.company}`);
        doc.fontSize(12).text(`Position: ${work.position}`);
        doc.fontSize(12).text(`Years: ${work.years}`);
    });

    doc.end();

    return outputPath;

};



export const register = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        if(!name || !username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        const profile = new Profile({userId: newUser._id});
        await profile.save();

        return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error in register controller:", error);
        return res.status(500).json({ message: error.message });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if(!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if(!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = crypto.randomBytes(32).toString("hex");

        await User.updateOne({ _id: user._id }, { $set: {token }});

        return res.status(200).json({ token, userId: user._id });
    } catch (error) {
        console.error("Error in login controller:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const uploadProfilePicture = async (req, res) => {
    const { token } = req.body;
    try {
        const user = await User.findOne({ token });
        if(!user) {
            return res.status(401).json({ message: "User not found" });
        }

        user.profilePicture = req.file.filename;

        await user.save();
        // console.log(`/uploads/${req.file.filename}`);

        return res.status(200).json({ message: "Profile picture updated successfully" , profilePicture: `${req.file.filename}`});
    } catch (error) {
        console.error("Error in uploadProfilePicture controller:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const updateUserProfile = async (req, res) => {

    try {
        const { token, ...newUserData } = req.body;

        const user = await User.findOne({ token });
        if(!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const { username, email } = newUserData;

        const existingUser = await User.findOne({ $or: [{ username }, { email }], _id: { $ne: user._id } });
        if(existingUser) {
            if(existingUser || String(existingUser._id) !== String(user._id)) {
                return res.status(400).json({ message: "User already exist" });
            }
        }

        Object.assign(user, newUserData);

        await user.save();

        return res.status(200).json({ message: "Profile updated successfully" }); 
    } catch (error) {
        console.error("Error in updateUserProfile controller:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const getUserAndProfile = async (req, res) => {
    try {
        const { token } = req.query;
        console.log(token);
        const user = await User.findOne({ token });
        if(!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const userProfile = await Profile.findOne({ userId: user._id })
            .populate('userId', 'name username email profilePicture');

        if(!userProfile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        return res.status(200).json(userProfile);
    } catch (error) {
        console.error("Error in getUserAndProfile controller:", error);
        return res.status(500).json({ message: error.message });    
    }
};

export const updateProfileData = async (req, res) => {
    try {
        const { token, ...newProfileData } = req.body;

        const user = await User.findOne({ token });
        if(!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const userProfileToUpdate = await Profile.findOne({ userId: user._id });
        if(!userProfileToUpdate) {
            return res.status(404).json({ message: "Profile not found" });
        }

        Object.assign(userProfileToUpdate, newProfileData);

        await userProfileToUpdate.save();

        return res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("Error in updateProfileData controller:", error);
        return res.status(500).json({ message: error.message });    
    }
};

export const getAllUserProfile = async (req, res) => {
    try {
        const allProfiles = await Profile.find()
            .populate('userId', 'name username email profilePicture');

        return res.status(200).json({allProfiles});
    } catch (error) {
        console.error("Error in getAllUserProfile controller:", error);
        return res.status(500).json({ message: error.message });    
    }
};

export const downloadProfile = async (req, res) => {
    try {
        const { id } = req.query;
        // console.log(id);
        const userProfile = await Profile.findOne({ userId: id })
            .populate('userId', 'name username email profilePicture');

        if(!userProfile) {
            return res.status(401).json({ message: "User not found" });
        }

        let outputPath = await convertUserFataTOPDF(userProfile);

        return res.json({ "message": outputPath });

    } catch (error) {
        console.error("Error in downloadProfile controller:", error);
        return res.status(500).json({ message: error.message });    
    }
};

export const sendConnectionRequest = async (req, res) => {
    try {
        const { token, connectionId } = req.body;

        const user = await User.findOne({ token });
        if(!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const connectionUser = await User.findById( connectionId );

        if(!connectionUser) {
            return res.status(404).json({ message: "Connection user not found" });
        }

        const existingRequest = await ConnectionRequest.findOne({ userId: user._id, connectionId: connectionId });

        if(existingRequest) {
            return res.status(400).json({ message: "Connection request already sent" });
        }

        let status_accepted = null;

        // console.log(connectionId, user._id);

        if(connectionId === user._id.toString()) {
            status_accepted = true;
        }

        const newConnectionRequest = new ConnectionRequest({
            userId: user._id,
            connectionId: connectionId,
            status_accepted
        });

        await newConnectionRequest.save();

        return res.status(200).json({ message: "Connection request sent successfully" });
    } catch (error) {
        console.error("Error in sendConnectionRequest controller:", error);
        return res.status(500).json({ message: error.message });    
    }
};

export const getConnectionRequests = async (req, res) => {
    // jo connection request humne bheji hein(sent)
    try {
        const { token } = req.query;

        const user = await User.findOne({ token });
        if(!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const connectionRequests = await ConnectionRequest.find({ userId: user._id })
            .populate('connectionId', 'name username email profilePicture');

        return res.status(200).json({ connectionRequests });
    } catch (error) {
        console.error("Error in getConnectionRequests controller:", error);
        return res.status(500).json({ message: error.message });    
    }
};

export const whatAreMyConnections = async (req, res) => {
    // jo connection request hume recieve huye(recieved)
    try {
        const { token } = req.query;

        const user = await User.findOne({ token });
        if(!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const connections = await ConnectionRequest.find({ connectionId: user._id })
        .populate('userId', 'name username email profilePicture');

        return res.status(200).json(connections);
    } catch (error) {
        console.error("Error in whatAreMyConnections controller:", error);
        return res.status(500).json({ message: error.message });    
    }
};

export const acceptConnectionRequest = async (req, res) => {
    try {
        const { token, requestId, action_type } = req.body;

        const user = await User.findOne({ token });
        if(!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const connectionRequest = await ConnectionRequest.findById({ _id: requestId });

        if(!connectionRequest) {
            return res.status(404).json({ message: "Connection request not found" });
        }

        if(action_type === "accept") {
            connectionRequest.status_accepted = true;
            await connectionRequest.save();
        } else if(action_type === "reject") {
            connectionRequest.status_accepted = false;
            await connectionRequest.save();
            await ConnectionRequest.findByIdAndDelete({ _id: requestId });
        }

        await connectionRequest.save();        

        return res.status(200).json({ message: "Request Updated" });
    } catch (error) {
        console.error("Error in acceptConnectionRequest controller:", error);
        return res.status(500).json({ message: error.message });    
    }
};

export const getUserProfileAndUserByUsername = async (req, res) => {
    const { username } = req.query;

    try {
        const user = await User.findOne({username: username});

        if(!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const userProfile = await Profile.findOne({userId: user._id})
            .populate('userId', 'name username email profilePicture');

        return res.status(200).json({ "profile": userProfile });
    } catch (error) {
        console.error("Error in getUserProfileAndUserByUsername controller:", error);
        return res.status(500).json({ message: error.message });
    }
};

