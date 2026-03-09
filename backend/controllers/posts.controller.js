import Post from "../models/posts.model.js";
import User from "../models/user.model.js";
import Comment from "../models/comments.model.js";


export const activeCheck = async (req, res) => {
    return res.status(200).json({ message: "RUNNING" });
}

export const createPost = async (req, res) => {
    const { token } = req.body;

    try {
        const user = await User.findOne({ token });

        if (!user) {
            return res.status(401).json({ message: "User Not found" });
        }

        const newPost = new Post({
            userId: user._id,
            body: req.body.body,
            media: req.file != undefined ? req.file.filename : "",
            fileType: req.file != undefined ? req.file.mimetype.split("/")[1] : ""
        });

        await newPost.save();

        return res.status(201).json({ message: "Post created successfully" });
    } catch (error) {
        console.error("Error creating post:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate("userId", "name username email profilePicture");
        return res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deletePost = async (req, res) => {
    const { token, postId } = req.body;

    try {
        const user = await User.findOne({ token });

        if (!user) {
            return res.status(401).json({ message: "User Not found" });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to delete this post" });
        }

        await Post.findByIdAndDelete(postId);

        return res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const commentPost = async (req, res) => {
    try {
        const { token, postId, commentBody } = req.body;

        // console.log(token);
        // console.log(postId);
        // console.log(commentBody);
        const user = await User.findOne({ token }).select("_id");
        if(!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const post = await Post.findOne({ _id: postId });
        if(!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const newComment = new Comment({
            postId: postId,
            userId: user._id,
            body: commentBody
        });

        await newComment.save();
        return res.status(200).json({ message: "Comment added successfully" });
    } catch (error) {
        console.error("Error in commentPost controller:", error);
        return res.status(500).json({ message: error.message });    
    }
};

export const getCommentsByPost = async (req, res) => {
    const { postId } = req.query;

    try {
        const post = await Post.findById(postId);
        // console.log(post);
        // console.log(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comments = await Comment.find({ postId }).populate("userId", "name username email profilePicture");
        return res.status(200).json(comments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteComment = async (req, res) => {
    const { token, commentId } = req.body;

    try {
        const user = await User.findOne({ token });

        if (!user) {
            return res.status(401).json({ message: "User Not found" });
        }

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (comment.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to delete this comment" });
        }

        await Comment.findByIdAndDelete(commentId);

        return res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error("Error deleting comment:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const incrementLikes = async (req, res) => {
    const { postId } = req.body; 

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        post.likes += 1;
        await post.save();

        return res.status(200).json({ message: "Likes incremented successfully", likes: post.likes });          
    } catch (error) {
        console.error("Error incrementing likes:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};