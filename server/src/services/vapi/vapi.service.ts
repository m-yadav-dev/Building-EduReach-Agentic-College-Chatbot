import ENV_VARS from "../../utils/env.ts";





interface CallPayload {
    // support both `phoneNumber` and `phone` keys (controller may send either)
    phoneNumber?: string;
    phone?: string;
    userName: string;
    userEmail: string;
    // support both `preferredCourse` and `course`
    preferredCourse?: string;
    course?: string;
    // support both `queryTopics` and `topic`
    queryTopics?: string;
    topic?: string;
}

interface VapiCallService {
    id: string;
    status: string;
    [key: string]: any;
}

export const initialOutboundCallPayload = async (payload: CallPayload): Promise<VapiCallService> => {
    // accept multiple possible keys from callers and normalize
    const phoneNumber = payload.phoneNumber ?? payload.phone;
    const userName = payload.userName;
    const userEmail = payload.userEmail;
    const preferredCourse = payload.preferredCourse ?? payload.course;
    const queryTopics = payload.queryTopics ?? payload.topic;

    const VAPI_API_KEY = ENV_VARS.VAPI_API_KEY;
    const VAPI_PHONE_NUMBER_ID = ENV_VARS.VAPI_PHONE_NUMBER_ID;
    const VAPI_ASSISTANT_ID = ENV_VARS.VAPI_ASSISTANT_ID;


    if (!VAPI_API_KEY || !VAPI_PHONE_NUMBER_ID || !VAPI_ASSISTANT_ID) {
        throw new Error("Missing required VAPI configuration variables");
    }

    // validate phone number
    if (!phoneNumber || typeof phoneNumber !== "string") {
        throw new Error("Invalid or missing phone number for VAPI call");
    }

    // format phone number - ensure +91 for Indian numbers
    const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber.replace(/^0+/, "")}`;

    const response = await fetch("https://api.vapi.ai/call", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${VAPI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            assistantId: VAPI_ASSISTANT_ID,
            assistantOverrides: {
                firstMessage: `Hi ${userName}, this is Ava from EduReach. I am here to assist you with your college queries. I see that you are interested in ${preferredCourse || "various courses"}. Could you please tell me more about your query or the topics you are interested in?`,
                variableValues: {
                    studentName: userName,
                    studentEmail: userEmail,
                    preferredCourse: preferredCourse || "Not specified",
                    queryTopics: queryTopics || "General inquiry",
                }
            },
            phoneNumberId: VAPI_PHONE_NUMBER_ID,
            customer: {
                number: formattedPhone,
                name: userName,
            }
        })
    })


    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`Failed to initiate call with VAPI. Status: ${response.status}, Response:`, errorData);
        throw new Error(`Failed to initiate call with VAPI. Status: ${response.status}, Response: ${JSON.stringify(errorData)}`);
    }

    const data = (await response.json()) as VapiCallService;
    return data;

} 