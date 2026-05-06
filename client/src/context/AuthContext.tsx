import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getUserProfile } from "../services/auth.service";






interface User { // define the Structure of the User object
    id: string;
    name: string;
    email: string;
    phone?: string;
}

interface AuthContextType { // define the Structure of the AuthContext

    user: User | null; // the current authenticated user, or null if not authenticated
    isLoading: boolean; // indicates if an authentication request is in progress
    login: (token: string) => void; // function to log in a user by setting the token and user data
    logout: () => void; // function to log out a user by clearing the token and user data
}



const AuthContext = createContext<AuthContextType | undefined>(undefined); // create the AuthContext with an undefined default value


export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null); // state to hold the current authenticated user
    const [isLoading, setIsLoading] = useState(false); // state to indicate if an authentication request is in progress


    useEffect(() => {
        const token = localStorage.getItem("token"); // check for an existing token in localStorage
        if (token) {
            getUserProfile().then((data) => {
                setUser(data); // if token is valid, set the user data in state
            }).catch(() => {
                localStorage.removeItem("token"); // if token is invalid, remove it from localStorage
                setUser(null); // clear the user data in state
            }).finally(() => {
                setIsLoading(false); // indicate that the authentication request is complete
            })


        }
        else {
            setIsLoading(false); // if no token is found, indicate that the authentication request is complete
        }
    }, []);




    const login = (token: string) => {
        localStorage.setItem("token", token); // save the token in localStorage
        getUserProfile().then((data) => {
            setUser(data); // set the user data in state after successful login
        }).catch(() => {
            localStorage.removeItem("token"); // if user profile retrieval fails, remove the token
            setUser(null); // clear the user data in state
        })

    }


    const logout = () => {
        localStorage.removeItem("token"); // remove the token from localStorage
        setUser(null); // clear the user data in state
    };



    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )


}


export function useAuth() {
    const context = useContext(AuthContext); // access the AuthContext
    if (!context) throw new Error("useAuth must be used within an AuthProvider"); // ensure that the hook is used within an AuthProvider
    return context; // return the context value

}