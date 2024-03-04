import './App.css';
import {useEffect, useState} from "react";
import {Route, Routes} from "react-router-dom";
import RegisterPage from "./pages/register-page/RegisterPage";
import ChatPage from "./pages/chat-page/ChatPage";
import LoginPage from "./pages/login-page/LoginPage";
import {AuthorizationJwtName} from "./contstants";
import LogoutPage from "./pages/logout-page/LogoutPage";

function App() {
    const [isAuth, setIsAuth] = useState(false)
    useEffect(() => {
        handleAuth()
    }, []);
    
    const handleAuth = () => {
        if (localStorage.getItem(AuthorizationJwtName))
            setIsAuth(true)
    }
    
  return (
      <>
          <div style={{display:'flex', justifyContent:'space-evenly'}}>
              <a href="/">Чат</a>
              {
                  isAuth
                      ?
                      <>
                          <a href="/logout">Выйти</a>
                      </>
                      :
                      <>
                          <a href="/login">Логин</a>
                          <a href="/register">Регистрация</a>
                      </>
              }
          </div>
          <Routes>
              <Route path="/" element={<ChatPage handleAuth={handleAuth}/>}/>
              <Route path="/login" element={<LoginPage handleAuth={handleAuth}/>}/>
              <Route path="/register" element={<RegisterPage handleAuth={handleAuth}/>}/>
              <Route path="/logout" element={<LogoutPage handleAuth={handleAuth}/>}/>
          </Routes>
      </>
  );
}

export default App;
