import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {AuthorizationJwtName} from "../../contstants";

const LogoutPage = ({handleAuth}) => {
    const navigate = useNavigate()
    useEffect(() => {
        localStorage.removeItem(AuthorizationJwtName);
        handleAuth()
        navigate('/')
    }, []);
}

export default LogoutPage