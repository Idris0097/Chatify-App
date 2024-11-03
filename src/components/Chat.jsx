import React, { useState, useEffect } from 'react';


const sanitizeMessageContent = (content) => {
  const tempElement = document.createElement('div');
  tempElement.innerText = content;
  return tempElement.innerHTML;
};

const Chat = ({ token }) => {
  const [chatMessages, setChatMessages] = useState(JSON.parse(localStorage.getItem('chatMessages')) || []);
  const [inputMessage, setInputMessage] = useState('');
  const [fetchError, setFetchError] = useState('');
  const [currentConversation, setCurrentConversation] = useState(localStorage.getItem('currentConversationId') || '');
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('currentUsername') || '');
  const [currentUserId] = useState(localStorage.getItem('currentUserId') || '');
  const [allConversations, setAllConversations] = useState(JSON.parse(localStorage.getItem('allConversations')) || []);


  const fakeResponses = [
    "Hej! Hur kan jag hjälpa dig idag? Jag kan svara på frågor, hjälpa till med vägledning eller ge dig tips om det du söker.",
    "Tack för din fråga! Kan du ge mig lite mer detaljer så jag kan ge ett bättre svar?",
    "Jag är inte helt säker på vad du menar. Kan du omformulera eller ge mig fler detaljer?",
    "Något verkar ha gått fel. Jag jobbar på att lösa det, försök gärna om en liten stund!",
    "Oj, bra fråga! Inte varje dag man hör den. Ska kika på det!",
    "Det låter spännande!",
    "Du har det här! Låt mig veta om du behöver mer hjälp på vägen",
  ];

  
  const getRandomResponse = () => {
    return fakeResponses[Math.floor(Math.random() * fakeResponses.length)];
  };

  useEffect(() => {
    if (!currentConversation) return;

    const loadMessages = async () => {
      try {
        const response = await fetch(`https://chatify-api.up.railway.app/messages?conversationId=${currentConversation}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Något gick fel');

        const fetchedMessages = await response.json();
        setChatMessages(fetchedMessages);
        localStorage.setItem('chatMessages', JSON.stringify(fetchedMessages));

        const isConversationExist = allConversations.some((conversation) => conversation.id === currentConversation);
        if (!isConversationExist) {
          const newConversation = {
            id: currentConversation,
            name: 'Ny konversation',
          };
          const updatedConversations = [...allConversations, newConversation];
          setAllConversations(updatedConversations);
          localStorage.setItem('allConversations', JSON.stringify(updatedConversations));
        }
      } catch (error) {
        setFetchError('Något gick fel');
      }
    };

    loadMessages();
  }, [currentConversation, token, allConversations]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      const response = await fetch('https://chatify-api.up.railway.app/messages', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sanitizeMessageContent(inputMessage),
          conversationId: currentConversation,
        }),
      });

      if (!response.ok) throw new Error('Något gick fel tyvärr');

      const { latestMessage } = await response.json();
      setChatMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, { ...latestMessage, userId: currentUserId, username: currentUser }];
        localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
        return updatedMessages;
      });

      setInputMessage('');

    
      setTimeout(() => {
        const fakeResponse = {
          id: Math.random().toString(36).substr(2, 9),
          text: getRandomResponse(),
          conversationId: currentConversation,
          userId: 'Idris',
          username: 'ChatAI',
          avatar: 'https://i.pravatar.cc/100?u=bot123',
        };

        setChatMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, fakeResponse];
          localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
          return updatedMessages;
        });
      }, 2000); 

    } catch (error) {
      setFetchError('Något gick fel tyvärr');
    }
  };

  const removeMessage = async (messageId) => {
    try {
      const response = await fetch(`https://chatify-api.up.railway.app/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Det gick fel med att radera');

      setChatMessages((previousMessages) => {
        const updatedMessages = previousMessages.filter((message) => message.id !== messageId);
        localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
        return updatedMessages;
      });
    } catch (error) {
      setFetchError('Det gick fel med att radera');
    }
  };

  const selectConversation = (conversation) => {
    setCurrentConversation(conversation.id);
    localStorage.setItem('currentConversationId', conversation.id);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <div className="chat-container">
        <div className="chat-header">
          <h2 className="chat-title">
            Chatt: {allConversations.find((convo) => convo.id === currentConversation)?.name || ''}
          </h2>
        </div>
        <div className="chat-messages">
          <div className="message-list">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`message-bubble ${message.userId?.toString() === currentUserId?.toString() ? 'sent' : 'received'}`}
              >
                <div className="message-avatar">
                  <img src={message.avatar || 'https://i.pravatar.cc/100'} alt="avatar" />
                </div>
                <div className="message-content">
                  <div className="message-username">{message.username}</div>
                  <p className="message-text" dangerouslySetInnerHTML={{ __html: sanitizeMessageContent(message.text) }}></p>
                  {message.userId?.toString() === currentUserId?.toString() && (
                    <button
                      onClick={() => removeMessage(message.id)}
                      className="remove-message-btn"
                    >
                      Ta bort
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="chat-input-container">
          <input
            id="inputMessage"
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Nu kan du skriva ditt meddelande."
            className="input-message"
          />
          <button
            onClick={sendMessage}
            className="send-button"
          >
            ✉
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
