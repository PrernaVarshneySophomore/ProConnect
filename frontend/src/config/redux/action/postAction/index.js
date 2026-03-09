import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const createPost = createAsyncThunk(
    "/post/createPost",
    async (userData, thunkAPI) => {
        const {file, body} = userData;

        try {

            const formData = new FormData();
            formData.append('token', localStorage.getItem('token'))
            formData.append('body', body)
            formData.append('media', file)


            const response = await clientServer.post("/post", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if(response.status === 200) {
                return thunkAPI.fulfillWithValue("Post Uploaded");
            } else {
                return thunkAPI.rejectWithValue("Post Not Uploaded !")
            }

        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

export const getAllPosts = createAsyncThunk(
    "post/getAllPosts",
    async (_, thunkAPI) => {
        try {
            const response = await clientServer.get("/posts");

            return thunkAPI.fulfillWithValue(response.data);
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    } 
);

export const deletePost = createAsyncThunk(
    "post/deletePost",
    async (postId, thunkAPI) => {
        try {
            // console.log(postId);
            const response = await clientServer.delete("/delete_post", {
                data: {
                    token: localStorage.getItem("token"),
                    postId: postId
                }
            });

            return thunkAPI.fulfillWithValue(response.data);
        } catch(error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

export const incrementPostLikes = createAsyncThunk(
    "/post/incrementLikes",
    async (postId, thunkAPI) => {
        try {
            const response = await clientServer.post("/increment_post_like", {
                postId: postId
            })

            return thunkAPI.fulfillWithValue(response.data);
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

export const getAllComments = createAsyncThunk(
    "/post/getAllComments",
    async (postId, thunkAPI) => {
        try {
            // console.log(postId);
            const response = await clientServer.get("/get_comments", {
                params: {
                    postId: postId
                }
            });

            return thunkAPI.fulfillWithValue({
                comments:response.data,
                postId: postId
            });
        } catch (error) {
            return thunkAPI.rejectWithValue(response.data);
        }
    }
);

export const postComment = createAsyncThunk(
    "/post/postComment",
    async (commentData, thunkAPI) => {
        try {
            const response = await clientServer.post("/comment", {                    token: localStorage.getItem("token"),
            postId: commentData.post_id,
            commentBody: commentData.body
        });

            return thunkAPI.fulfillWithValue(response.data);
        } catch (error) {
            return thunkAPI.rejectWithValue(response.data);
        }
    }
);