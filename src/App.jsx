import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";
import lens from "./assets/lens.png";
import loadingGif from "./assets/loading.gif";
import closeImage from "./assets/botao-fechar.png";
import clearImage from "./assets/lixeira.png";

function makeLinksClickable(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url) => {
    return (
      '<a href="' +
      url +
      '" target="_blank" rel="noopener noreferrer">clique aqui</a>'
    );
  });
}

function App() {
  const [question, updatePrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    const welcomeMessage = "Olá! Eu sou a Zaila. Como posso ajudar você hoje?";
    setMessages([{ type: "answer", content: welcomeMessage }]);
    inputRef.current.focus();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendPrompt = async (event) => {
    if (event.key !== "Enter" || question.trim() === "") {
      return;
    }

    try {
      const predictionUrl =
        "https://zaila-language.cognitiveservices.azure.com/language/:query-knowledgebases?projectName=Zaila&api-version=2021-10-01&deploymentName=production";
      const subscriptionKey = "1bb05b6289a0497ea06bd1219f1eef3e";

      setLoading(true);

      const headers = {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": subscriptionKey,
      };

      const requestBody = {
        question: question,
        top: 1,
      };

      const response = await axios.post(predictionUrl, requestBody, {
        headers,
      });
      if (
        response.data &&
        response.data.answers &&
        response.data.answers.length > 0
      ) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "question", content: question },
          {
            type: "answer",
            content: makeLinksClickable(response.data.answers[0].answer),
          },
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "question", content: question },
          { type: "answer", content: "Nenhuma resposta encontrada." },
        ]);
      }

      updatePrompt("");
    } catch (error) {
      console.error("Error:", error);
      // Handle the error appropriately
    } finally {
      setLoading(false);
    }
  };
  const fecharGuia = () => {
    window.close();
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const scrollToBottom = () => {
    const chatbox = document.getElementById("chatbox");
    chatbox.scrollTop = chatbox.scrollHeight;
  };

  return (
    <div className="app">
      <div className="app-container">
        <div className="spotlight__option">
          <h2 className="nome-chat">
            Zaila <div className="online"></div>
          </h2>
          <button className="custom--button" onClick={clearMessages}>
            <img src={clearImage} alt="Icon" className="icon" />
          </button>
          <button className="custom-button" onClick={fecharGuia}>
            <img src={closeImage} alt="Icon" className="icon" />
          </button>
        </div>
        <div className="spotlight__wrapper">
          <div className="spotlight__answer" id="chatbox">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chatbox_message ${
                  message.type === "question" ? "question" : "answer"
                }`}
                dangerouslySetInnerHTML={{ __html: message.content }}
              ></div>
            ))}
          </div>

          <input
            ref={inputRef}
            type="text"
            className="spotlight__input"
            placeholder="Digite uma pergunta..."
            value={question}
            onChange={(e) => updatePrompt(e.target.value)}
            onKeyDown={(e) => sendPrompt(e)}
            disabled={loading}
            style={{
              backgroundImage: loading ? `url(${loadingGif})` : `url(${lens})`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;