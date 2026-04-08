import { useState } from "react";
import {  useNavigate } from "react-router";



export const Landing = () => {

    const [ username, setUsername ] = useState<string>("");

    const navigate = useNavigate();

  return (
    <div>
      <h1>Landing Page</h1>
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      <button onClick={() => {
        navigate(`/room/${username}`);
      }}>
        Join
      </button>
    </div>
  )


}