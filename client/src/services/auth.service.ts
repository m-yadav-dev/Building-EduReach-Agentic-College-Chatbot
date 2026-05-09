import axiosInstance from "./api";

// register API call - POST /api/auth/register in server/src/routes/auth.routes.ts
export const registerUser = async (data: {
    name: string; email: string; password: string; phone?: string;
}) => {
    const response = await axiosInstance.post("/auth/register", data);
    // backend returns { success, message, data: { token, user } }
    return response.data.data; // return { token, user }
}


// login API call - POST /api/auth/login in server/src/routes/auth.routes.ts
export const loginUser = async (data: { email: string; password: string }) => {
    const response = await axiosInstance.post("/auth/login", data);
    // backend returns { success, message, data: { token, user } }
    return response.data.data; // return { token, user }
}



// get user profile API call - GET /api/auth/profile in server/src/routes/auth.routes.ts
export const getUserProfile = async () => {
    const response = await axiosInstance.get("/auth/profile");
    // backend returns { success, message, data: { user } }
    return response.data.data.user; // return the user object
}


