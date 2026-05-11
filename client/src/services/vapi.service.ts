import axiosInstance from "./api";







export const initialCall = async (data: {phone: string; course: string; topic: string}) => {
    const response = await axiosInstance.post("/vapi/call", {
        phoneNumber: data.phone,
        preferredCourse: `${data.course} - ${data.topic}`,
    });
    return response.data;
}