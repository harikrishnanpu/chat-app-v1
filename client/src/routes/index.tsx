import { createBrowserRouter } from "react-router";
import { Landing } from "../pages/Landing";
import { Room } from "../pages/Room";
import { Broadcast } from "../pages/Broadcast";
    

export const router = createBrowserRouter([
    {
      path: "/",
      element: <Landing /> ,
    },
    {
      path: "/room/:roomId",
      element: <Room /> ,
    },
    {
      path: '/broadcast/:roomId',
      element: <Broadcast /> ,
    }
]);
  