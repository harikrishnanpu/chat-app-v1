import { useState } from "react";
import {  useNavigate } from "react-router";


const API_URL = "http://localhost:3000";


export const Landing = () => {

    const [ username, setUsername ] = useState<string>("");

    const navigate = useNavigate();

    const createRoom = async () => {

      try {

      const response = await fetch(`${API_URL}/room`, {
        method: "POST",
        body: JSON.stringify({ username })
      });

      const data = await response.json();

      if(response.ok) {
        navigate(`/room/${data.roomId}`);
      } else {
        // alert(data.message);
        console.log(data.message);
      }

    }catch(Er){
      alert(Er)
    }
    }

  return (
    <div className="flex flex-col items-center justify-center h-screen">

      <div className="max-w-md w-full">
      <h1 className="text-2xl font-bold mb-5 text-center">Landing Page</h1>
      <input className="border-2 border-gray-300 rounded-md p-2 w-full" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      <button className="bg-blue-500 text-white rounded-md p-2 mt-5 w-full text-center" onClick={() => {
        navigate(`/room/${username}`);
      }}>
        Join
      </button>
        <button className="bg-green-500 text-white rounded-md p-2 mt-5 w-full text-center" onClick={createRoom}>Create Room</button>
        </div>
    </div>
  )


}