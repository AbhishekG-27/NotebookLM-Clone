"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { usePdf } from "@/contexts/PdfContext";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  pageNumber: number | null;
}

const ChatArea = ({ file_id }: { file_id: string }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: crypto.randomUUID(),
      text: "Hello! It seems you have uploaded a PDF document. How can I help you with it?",
      isUser: false,
      timestamp: new Date(Date.now()),
      pageNumber: null,
    },
  ]);
  const [isResponding, setIsResponding] = useState(false);

  const { scrollToPage } = usePdf();

  const handlePageScroll = (pageNumber: number | null) => {
    if (pageNumber == null) {
      return;
    }
    scrollToPage(pageNumber);
  };

  const handleSendMessage = async () => {
    setIsResponding(true);
    try {
      if (message.trim()) {
        const userMessage: Message = {
          id: crypto.randomUUID(),
          text: message,
          isUser: true,
          timestamp: new Date(),
          pageNumber: null,
        };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
      }

      const formData = new FormData();
      formData.append("prompt", message);
      formData.append("file_id", file_id);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (data.error) {
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          text: data.error,
          isUser: false,
          timestamp: new Date(),
          pageNumber: null,
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
        console.error("Error from server:", data.error);
        return;
      }
      const newAIMessage: Message = {
        id: crypto.randomUUID(),
        text: data.response,
        isUser: false,
        timestamp: new Date(),
        pageNumber: data.citations.length > 0 ? data.citations[0] : null,
      };
      setMessages((prevMessages) => [...prevMessages, newAIMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        text: "Error sending message",
        isUser: false,
        timestamp: new Date(),
        pageNumber: null,
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      console.error("Error sending message:", error);
    } finally {
      setMessage("");
      setIsResponding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Chat Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between p-4 bg-white border-b border-slate-200 shadow-sm"
      >
        <div className="flex items-center space-x-3">
          <motion.div
            className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-white font-semibold text-sm">AI</span>
          </motion.div>
          <div>
            <h3 className="font-semibold text-gray-900">PDF Assistant</h3>
            <p className="text-sm text-gray-500">Online • Ready to help</p>
          </div>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{
                duration: 0.3,
                delay: index * 0.1,
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex max-w-[80%] ${
                  msg.isUser ? "flex-row-reverse" : "flex-row"
                } items-end space-x-2`}
              >
                {/* Avatar */}
                {!msg.isUser && (
                  <motion.div
                    className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-1"
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-white font-semibold text-xs">AI</span>
                  </motion.div>
                )}

                {/* Message Bubble */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`relative px-4 py-3 rounded-2xl shadow-sm ${
                    msg.isUser
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white ml-2"
                      : "bg-white text-gray-800 border border-slate-200 mr-2"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>

                  {/* Message tail */}
                  <div
                    className={`absolute bottom-0 w-3 h-3 ${
                      msg.isUser
                        ? "right-0 translate-x-1 bg-blue-600"
                        : "left-0 -translate-x-1 bg-white border-l border-b border-slate-200"
                    } rotate-45`}
                  />

                  {msg.pageNumber != null && (
                    <button
                      onClick={() => handlePageScroll(msg.pageNumber! + 1)}
                      className="text-xs text-blue-500 cursor-pointer"
                    >
                      [Page {msg.pageNumber + 1}]
                    </button>
                  )}

                  {/* Timestamp */}
                  <div
                    className={`mt-1 text-xs ${
                      msg.isUser ? "text-blue-100" : "text-gray-400"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Message Bubble */}
        {isResponding ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-xs">AI</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </div>

      {/* Input Area */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-4 bg-white border-t border-slate-200"
      >
        <div className="flex items-center space-x-3">
          {/* Message Input */}
          <div className="flex-1 relative">
            <motion.textarea
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your PDF..."
              className="w-full resize-none border border-slate-200 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 max-h-32"
              rows={1}
              style={{
                minHeight: "44px",
                height:
                  Math.min(44 + (message.split("\n").length - 1) * 20, 128) +
                  "px",
                overflow: "hidden", // This removes the scrollbar
              }}
            />
          </div>

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className={`p-3 rounded-full transition-all duration-200 ${
              message.trim()
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <motion.div
              animate={message.trim() ? { x: 2 } : { x: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <Send size={18} />
            </motion.div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatArea;
