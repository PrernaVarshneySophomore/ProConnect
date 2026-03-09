import { createSlice } from "@reduxjs/toolkit";
import { getAllUsers, getConnectionsRequest, getMyConnectionRequests, loginUser, registerUser } from "../../action/authAction";
import { getAboutUser } from "../../action/authAction";

const initialState = {
    user: undefined,
    userLoggedIn: false,
    isError: false,
    isSuccess: false,
    isLoading: false,
    loggedIn: false,
    message: "",
    isTokenThere: false,
    profileFetched: false,
    all_users: [],
    all_profiles_fetched: false,
    connections: [],
    connectionRequests: []
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        reset: () => initialState,
        handleLoginUser: (state) => {
            state.message = "hello"
        },
        emptyMessage: (state) => {
            state.message = ""
        },
        setTokenIsThere: (state) => {
            state.isTokenThere = true;
        },
        setTokenIsNotThere: (state) => {
            state.isTokenThere = false;
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(loginUser.pending, (state) => {
            state.isLoading = true;
            state.userLoggedIn = false;
            state.message = "Logging in...";
        })
        .addCase(loginUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = true;
            state.isTokenThere = true;
            state.userLoggedIn = true;
            state.loggedIn = true;
            state.message = "Login successful!";
        })
        .addCase(loginUser.rejected, (state, action) => {
            state.isLoading = false;
            state.userLoggedIn = false;
            state.isError = true;
            state.isSuccess = false;
            state.loggedIn = false;
            state.message = action.payload || "Login failed!";
        })
        .addCase(registerUser.pending, (state) => {
            state.isLoading = true;
            state.message = "Registering...";
            state.userLoggedIn = false;
        })
        .addCase(registerUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = true;
            state.userLoggedIn = true;
            state.message = {
                message: "Registration successful, Please Log In !"
            };
        })
        .addCase(registerUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.userLoggedIn = false;
            state.isSuccess = false;
            state.message = action.payload || "Registration failed!";
        })
        .addCase(getAboutUser.pending, (state) => {
            state.isLoading = true;
            state.userLoggedIn = true;
        })
        .addCase(getAboutUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.profileFetched = true;
            state.user = action.payload;
            state.userLoggedIn = true;
        })
        .addCase(getAboutUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.userLoggedIn = true;
            state.profileFetched = false;
            state.message = action.payload || "Failed to fetch profile";
        })
        .addCase(getAllUsers.pending, (state) => {
            state.isLoading = true;
            state.userLoggedIn = true;
        })
        .addCase(getAllUsers.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.all_profiles_fetched = true;
            state.userLoggedIn = true;
            state.all_users = action.payload.allProfiles
        })
        .addCase(getAllUsers.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.userLoggedIn = true;
            state.all_profiles_fetched = false;
            state.message = action.payload || "Failed to fetch profiles";
        })
        .addCase(getConnectionsRequest.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(getConnectionsRequest.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = true;
            state.userLoggedIn = true;
            state.connections = action.payload;
            // console.log("connections",action.payload);
            state.message = "Connections Request sent fetched successfully !";
        })
        .addCase(getConnectionsRequest.rejected, (state, action) => {
            state.isLoading = false;
            state.userLoggedIn = true;
            state.isError = true;
            state.message = action.payload || "Failed to fetch connections request sent";
        })
        .addCase(getMyConnectionRequests.pending, (state) => {
            state.userLoggedIn = true;
            state.isLoading = true;
        })
        .addCase(getMyConnectionRequests.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.userLoggedIn = true;
            state.isSuccess = true;
            state.connectionRequests = action.payload;
            // console.log("REDUCER", action.payload);
            state.message = "Connections request recieved fetched successfully !";

        })
        .addCase(getMyConnectionRequests.rejected, (state, action) => {
            state.isLoading = false;
            state.userLoggedIn = true;
            state.isError = true;
            state.message = action.payload || "Failed to fetch connections request recieved";
        })
        
    }
});

export const {reset, emptyMessage, setTokenIsThere, setTokenIsNotThere} = authSlice.actions;

export default authSlice.reducer;