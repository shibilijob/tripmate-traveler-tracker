import Message from "../../models/Message.js";


const getChatHistory = async (req, res) => {
    try {
        const { roomId } = req.params;

        // 1. Fetch messages for this specific room
        // 2. Sort by 'time' (1) so oldest are at the top, newest at bottom
        // 3. Limit to 100 so the initial load isn't too heavy
        const messages = await Message.find({ roomId })
            .sort({ time: 1 }) 
            .limit(100);

        res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        console.error("Chat History Error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to load chat history."
        });
    }
};

export default getChatHistory;