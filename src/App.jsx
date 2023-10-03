import { useState } from "react";
import lens from "./assets/lens.png";
import loadingGif from "./assets/loading.gif";
import closeImage from "./assets/botao-fechar.png";
import clearImage from "./assets/lixeira.png";
import axios from "axios";
import "./App.css";

function App() {
  const [question, updatePrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const sendPrompt = async (event) => {
    if (event.key !== "Enter" || question.trim() === "") {
      return;
    }

    try {
      const predictionUrl =
        "https://canal-idioma.cognitiveservices.azure.com/language/:query-knowledgebases?projectName=Zaila&api-version=2021-10-01&deploymentName=production";
      const subscriptionKey = "2e45b815bcfe4971b9f85fa2e86ca03c";

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
        setMessages([
          ...messages,
          { type: "question", content: question },
          { type: "answer", content: response.data.answers[0].answer },
        ]);
      } else {
        setMessages([
          ...messages,
          { type: "question", content: question },
          { type: "answer", content: "Nenhuma resposta encontrada." },
        ]);
      }
    // Clear the input field
    updatePrompt("");

    // Scroll to bottom
    scrollToBottom();


    } catch (error) {
      console.error("Error:", error);
      setAnswer("Um erro ocorreu.");
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
              >
                {message.content}
              </div>
            ))}
          </div>

          <input
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
