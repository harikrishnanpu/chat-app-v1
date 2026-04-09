import { createBrowserRouter } from "react-router";
import { Landing } from "../pages/Landing";
import { Room } from "../pages/Room";
    

export const router = createBrowserRouter([
    {
      path: "/",
      element: <Landing /> ,
    },
    {
      path: "/room/:roomId",
      element: <Room /> ,
    }
]);
  