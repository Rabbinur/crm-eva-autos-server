export const connectSocket = (server: any) => {
  console.log("⚠️ Socket.IO connections are skipped/disabled for Vercel");
  return null;
};

export const getIO = () => {
  return {
    emit: (event: string, payload: any) => {
      console.log(`[Mock Socket.IO] Emit event: ${event}`);
    },
    to: (room: string) => {
      return {
        emit: (event: string, payload: any) => {
          console.log(`[Mock Socket.IO] Emit to room ${room} event: ${event}`);
        }
      };
    }
  };
};
