import axiosInstance from "./api";





// Backend Excepts: { phoneNumber: string; preferredCourse: string;}
// Route is protected: POST /api/vapi/call {requires auth token in headers}

export const initialCall = async (data: {phone: string; course: string; topic: string}) => {
    const response = await axiosInstance.post("/vapi/call", {
        phoneNumber: data.phone,
        preferredCourse: `${data.course} - ${data.topic}`,
    });
    return response.data;
}


