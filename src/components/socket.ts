import { io } from "socket.io-client";

export const socket = io("10.13.0.10:28000",{
	transports: ["websocket"],
	autoConnect: true,
})