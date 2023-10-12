import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";
import lens from "./assets/lens.png";
import loadingGif from "./assets/loading.gif";
import closeImage from "./assets/botao-fechar.png";
import clearImage from "./assets/lixeira.png";
import microfone from "./assets/microfone-gravador.png";
import microfoneMudo from "./assets/microfone-mudo.png";
import falar from "./assets/falando.png";

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

const App = () => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [listening, setListening] = useState(false);
  const [recognizedSpeech, setRecognizedSpeech] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    const welcomeMessage = "Olá! Eu sou a Zaila. Como posso ajudar você hoje?";
    setMessages([{ type: "answer", content: welcomeMessage }]);
    inputRef.current.focus();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendPrompt = async (inputText) => {
    if (inputText.trim() === "") {
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
        question: inputText,
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
          { type: "question", content: inputText },
          {
            type: "answer",
            content: makeLinksClickable(response.data.answers[0].answer),
          },
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "question", content: inputText },
          { type: "answer", content: "Nenhuma resposta encontrada." },
        ]);
      }

      setQuestion("");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fecharGuia = () => {
    window.close();
  };

  const clearMessages = () => {
    setMessages([]);
    setRecognizedSpeech("");
  };

  const scrollToBottom = () => {
    const chatbox = document.getElementById("chatbox");
    chatbox.scrollTop = chatbox.scrollHeight;
  };

  const startListening = () => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.onstart = () => {
        setListening(true);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setRecognizedSpeech(transcript);
        sendPrompt(transcript);
      };

      recognition.start();
    } else {
      alert("O reconhecimento de fala não é compatível com seu navegador.");
    }
  };

  const stopListening = () => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.stop();
      setListening(false);
    } else {
      alert("O reconhecimento de fala não é compatível com seu navegador.");
    }
  };

  const speak = (text) => {
    if ("speechSynthesis" in window) {
      const speechSynthesis = window.speechSynthesis;
      const voices = speechSynthesis.getVoices();
      
      // Encontre a voz feminina em português, preferencialmente a voz do Google
      const portugueseVoice = voices.find((voice) => voice.lang === 'pt-BR' && voice.name.includes('Google'));
  
      const selectedVoice = portugueseVoice;
  
      if (selectedVoice) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = selectedVoice;
        speechSynthesis.speak(utterance);
      } else {
        alert("No suitable Portuguese voice found.");
      }
    } else {
      alert("Text-to-speech is not supported in your browser.");
    }
  };
  

  return (
    <div className="app">
      <div className="app-container">
        <div className="spotlight__option">
          <h2 className="nome-chat">
            Zaila <div className="online"></div>
          </h2>
          {listening ? (
            <button className="custom--button" onClick={stopListening}>
              <img src={microfoneMudo} alt="Icon" className="icon" />
            </button>
          ) : (
            <button className="custom--button" onClick={startListening}>
              <img src={microfone} alt="Icon" className="icon" />
            </button>
          )}
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
      >
        <span dangerouslySetInnerHTML={{ __html: message.content }}></span>
        <button
          className="read-aloud-button"
          onClick={() => speak(message.content)}
          style={{
            backgroundColor: "transparent",
            padding: "0",
            border: "none",
            marginLeft: "15px",
            display: "inline-block",
            verticalAlign: "middle", // Center the button vertically
          }}
        >
          <img src={falar} alt="Icon" className="icon" />
        </button>
      </div>
    ))}
  </div>

  <input
    ref={inputRef}
    type="text"
    className="spotlight__input"
    placeholder="Digite uma pergunta..."
    value={question}
    onChange={(e) => setQuestion(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        sendPrompt(question);
      }
    }}
    disabled={loading || listening}
    style={{
      backgroundImage: loading ? `url(${loadingGif})` : `url(${lens})`,
    }}
  />
</div>
      </div>
    </div>
  );
};

export default App;
