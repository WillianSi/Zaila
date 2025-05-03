import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Mic, Send, Trash2, Volume2 } from "lucide-react";
import "./App.css";

const App = () => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [listening, setListening] = useState(false);
  const chatboxRef = useRef(null);

  const backendUrl = "https://zaila-backend.onrender.com/chat";

  useEffect(() => {
    setMessages([{ type: "bot", content: "Olá! Sou a Zaila. Como posso ajudar você hoje?" }]);
  }, []);

  useEffect(() => {
    chatboxRef.current?.scrollTo(0, chatboxRef.current.scrollHeight);
  }, [messages]);

  const sendPrompt = async (inputText) => {
    if (!inputText.trim()) return;

    setLoading(true);
    setMessages((prev) => [...prev, { type: "user", content: inputText }]);
    setQuestion("");

    try {
      const response = await axios.post(backendUrl, { message: inputText });

      if (response.data && response.data.response) {
        setMessages((prev) => [...prev, { type: "bot", content: response.data.response }]);
      } else {
        setMessages((prev) => [...prev, { type: "bot", content: "Nenhuma resposta encontrada." }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { type: "bot", content: "❗ Erro ao buscar resposta." }]);
    } finally {
      setLoading(false);
    }
  };

  const speak = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      window.speechSynthesis.speak(utterance);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Reconhecimento de voz não suportado.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = (e) => {
      console.error("Erro no reconhecimento:", e);
      setListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuestion(transcript);
      sendPrompt(transcript);
    };

    recognition.start();
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Zaila</h1>
        <button className="clear-btn" onClick={clearMessages}>
          <Trash2 size={20} />
        </button>
      </header>

      <div className="chatbox" ref={chatboxRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.type}`}>
            <p>
  {msg.content.split('\n').map((line, i) => (
    <span key={i}>
      {line}
      <br />
    </span>
  ))}
</p>
            {msg.type === "bot" && (
              <button className="speak-btn" onClick={() => speak(msg.content)}>
                <Volume2 size={18} />
              </button>
            )}
          </div>
        ))}
        {loading && <div className="message bot"><p>Digitando...</p></div>}
      </div>

      <footer className="input-area">
        <input
          type="text"
          placeholder="Digite ou fale sua mensagem..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendPrompt(question)}
          disabled={loading}
        />
        <button onClick={() => sendPrompt(question)} disabled={loading}>
          <Send size={20} />
        </button>
        <button onClick={startListening} className={listening ? "mic-on" : ""}>
          <Mic size={20} />
        </button>
      </footer>
    </div>
  );
};

export default App;