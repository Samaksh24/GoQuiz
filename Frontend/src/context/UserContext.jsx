import axios from "axios";
import { createContext,useEffect,useState } from "react";

const UserContext = createContext();

function UserProvider ({children}){
    const [user, setUser] = useState(null)

    useEffect(()=>{
       const getUser = async()=>{
            const response = await axios.get('http://localhost:3000/api/auth/me',{withCredentials:true})
            setUser(response.data.user);
       }
       getUser();
    },

    [])
   
    return(
    <UserContext.Provider value = {{user,setUser}}>
        {children}
        </UserContext.Provider>
    )
    
}

export {UserContext,UserProvider}