import axiosInstance from "./api";






// sendMessage API call - POST /api/chat/message in server/src/routes/chat.routes.ts
// response.data.data will contain the answer from the backend { success, message, data: { answer } }
// we return response.data.data which is { answer } to the caller of sendMessage function in client/src/components/ChatDrawer.tsx

export const sendMessage = async (message: string) => { // API call to send a message to the backend and receive a response
    const response = await axiosInstance.post("/chat/message", { message }); // backend returns { success, message, data: { answer } } 
    return response.data.message; // return the answer from the backend
}



