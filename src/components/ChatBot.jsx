import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your Prep Assistant. I can help you find resources or answer simple FAQs!", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    const userMsg = { id: Date.now(), text: input, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    
    // Simple static response logic
    setTimeout(() => {
      let responseText = "Thanks for your message! Our community is here to help.";
      if (input.toLowerCase().includes("hello") || input.toLowerCase().includes("hi")) {
        responseText = "Hello there! How can I help you today?";
      } else if (input.toLowerCase().includes("interview")) {
        responseText = "Check out our 'Explore Feed' for real interview experiences!";
      } else if (input.toLowerCase().includes("share")) {
        responseText = "You can share your own journey by clicking the 'Share' button in the navbar.";
      }

      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: responseText, 
        isBot: true 
      }]);
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 flex flex-col max-h-125">
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <h3 className="text-white font-bold flex items-center gap-2">
                Prep Assistant <Sparkles className="w-3 h-3 text-yellow-300" />
              </h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.isBot 
                    ? 'bg-white border border-gray-200 text-gray-700 rounded-tl-none shadow-sm' 
                    : 'bg-blue-600 text-white rounded-tr-none shadow-md'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
            />
            <button type="submit" className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors">
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:scale-110 transition-all duration-300"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default ChatBot;







// import React, { useState, useEffect, useRef } from 'react';
// import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
// import { callGeminiAPI } from '../api/gemini'; // API import karein

// const ChatBot = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState([
//     { id: 1, text: "Namaste! Main AI Prep Assistant hu. Interview, resources ya coding me madad chahiye? 🤖", isBot: true }
//   ]);
//   const [input, setInput] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, isOpen, isTyping]);

//   const handleSend = async (e) => {
//     e.preventDefault();
//     if (!input.trim()) return;
    
//     const userText = input;
//     setMessages(prev => [...prev, { id: Date.now(), text: userText, isBot: false }]);
//     setInput("");
//     setIsTyping(true);
    
//     const botResponseText = await callGeminiAPI(userText, "Aap ek helpful educational assistant ho. Chhote aur clear answers do.");
    
//     setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponseText, isBot: true }]);
//     setIsTyping(false);
//   };

//   return (
//     <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
//       {isOpen && (
//         <div className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[500px]">
//           <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center shrink-0">
//             <h3 className="text-white font-bold flex items-center gap-2">Prep AI <Sparkles className="w-3 h-3 text-yellow-300" /></h3>
//             <button onClick={() => setIsOpen(false)} className="text-white"><X className="w-5 h-5" /></button>
//           </div>
//           <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
//             {messages.map((msg) => (
//               <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
//                 <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.isBot ? 'bg-white border text-gray-700 rounded-tl-none' : 'bg-blue-600 text-white rounded-tr-none'}`}>{msg.text}</div>
//               </div>
//             ))}
//             {isTyping && <div className="text-gray-400 text-sm pl-2">AI is typing...</div>}
//             <div ref={messagesEndRef} />
//           </div>
//           <form onSubmit={handleSend} className="p-3 bg-white border-t flex gap-2 shrink-0">
//             <input type="text" value={input} onChange={(e) => setInput(e.target.value)} disabled={isTyping} placeholder="Ask a question..." className="flex-1 bg-gray-100 rounded-xl px-4 py-2 text-sm outline-none" />
//             <button type="submit" disabled={isTyping} className="bg-blue-600 text-white p-2 rounded-xl"><Send className="w-5 h-5" /></button>
//           </form>
//         </div>
//       )}
//       <button onClick={() => setIsOpen(!isOpen)} className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
//         {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
//       </button>
//     </div>
//   );
// };

// export default ChatBot;