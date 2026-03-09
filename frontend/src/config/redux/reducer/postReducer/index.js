import { createSlice } from "@reduxjs/toolkit";
import { deletePost, getAllComments, getAllPosts } from "@/config/redux/action/postAction";


const initialState = {
    posts: [],
    isError: false,
    postFetched: false,
    isLoading: false,
    loggedIn: false,
    message: "",
    comments: [],
    postId: "",
};

const postSlice = createSlice({
    name: "post",
    initialState,
    reducers: {
        reset: () => initialState,
        resetPostId: (state) => {
            state.postId = "";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllPosts.pending, (state) => {
                state.isLoading = true;
                state.message = "Fetching all posts...";
            })
            .addCase(getAllPosts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.posts = action.payload;
                state.postFetched = true;
                state.message = "Posts fetched successfully!";
            })
            .addCase(getAllPosts.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload || "Failed to fetch posts.";
            })
            .addCase(deletePost.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.message = "Posts deleted successfully!";
            })
            .addCase(deletePost.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload || "Post not deleted.";
            }).addCase(getAllComments.pending, (state) => {
                state.message = "Fetching all comments...";
                state.isLoading = true;
            }).addCase(getAllComments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.postId = action.payload.postId
                state.comments = action.payload.comments;
                state.message = action.payload || "Comments fetched successfully !";
            }).addCase(getAllComments.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload || "Failed to fetch comments.";
            })
    }
});

export const { reset, resetPostId } = postSlice.actions;

export default postSlice.reducer;