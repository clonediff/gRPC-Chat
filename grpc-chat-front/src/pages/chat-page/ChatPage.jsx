import {useEffect, useState} from "react";
import './ChatPage.css'
import {JoinRequest, ChatMessage} from '../../Protos/chat_pb'
import {AuthorizationJwtName, GrpcChatClient} from "../../contstants";
import {StatusCode} from "grpc-web";
import {useNavigate} from "react-router-dom";

const ChatPage = ({handleAuth}) => {
    const [messages, setMessages] = useState([]);
    const navigate = useNavigate()
    const metadata = {};
    metadata[`${AuthorizationJwtName}`] = localStorage.getItem(AuthorizationJwtName);
    
    useEffect(() => {
        const joinRequest = new JoinRequest();
        const stream = GrpcChatClient.join(joinRequest, metadata)
        stream.on("data", (msg) => {
            setMessages(prev => [...prev, msg])
            let messagesContainer = document.getElementById('messages_container')
            messagesContainer.scrolltop = messagesContainer.scrollHeight;
        });
        stream.on("error", (error) => {
            if (error.code === StatusCode.UNAUTHENTICATED){
                localStorage.removeItem(AuthorizationJwtName);
                navigate('/login')
            }
        })
        stream.on("status", (status) => {
            console.log('joined')
            console.log(status.code, status.details, status.metadata);
        });
        stream.on("end", () => {
            console.log("Stream ended.");
        });
        
        handleAuth()
    }, []);
    
    const onFinish = (e) => {
        e.preventDefault();
        const chatMessage = new ChatMessage();
        chatMessage.setMessage(e.target.message.value);
        chatMessage.setFillusername(true)
        GrpcChatClient.sendMessage(chatMessage, metadata, (error, response) => {
            if (error) return console.log(error)
            if (response.getSuccess())
                document.getElementById('message_input').value = ''
        })
    }
    
    return (<>
        <div className="chat-window">
            <div className="message-container" id='messages_container'>
                {
                    messages.map((message, idx) => 
                        <div key={`message-${idx}`} className="message">
                            {message.getUsername() ? `${message.getUsername()}:` : ''} {message.getMessage()}
                        </div>)
                }
            </div>
            <form className="input-container" onSubmit={onFinish}>
                <input className="message-input" id='message_input' type="text" name='message' placeholder="Type your message..."/>
                <button className="send-button" type='submit'>Send</button>
            </form>
        </div>
    </>)
}

export default ChatPage