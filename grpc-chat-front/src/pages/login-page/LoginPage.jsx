import {Button, Form, Input} from "antd";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {AuthorizationJwtName, GrpcAuthClient} from "../../contstants";
import {LoginDto} from '../../Protos/auth_pb'

const LoginPage = ({handleAuth}) => {
    const [form] = Form.useForm()
    const [msg, setMsg] = useState('')
    const navigate = useNavigate()
    useEffect(() => {
        handleAuth()
        if (localStorage.getItem(AuthorizationJwtName))
            navigate('/')
    }, []);
    
    const onFinish = (values) => {
        const loginDto = new LoginDto() 
        loginDto.setUsername(values.username)
        loginDto.setPassword(values.password)
        GrpcAuthClient.login(loginDto, null, (error, response) => {
            if (error) return console.log(error)
            if (response.getIssuccess()) {
                localStorage.setItem(AuthorizationJwtName, `Bearer ${response.getJwt()}`);
                navigate('/');
            } else
                setMsg(response.getErrormessage())
        })
    }
    
    return (<>
        <Form
            layout="vertical"
            form={form}
            name="register"
            onFinish={onFinish}
            style={{maxWidth:450}}
            scrollToFirstError>
            <Form.Item
                name="username"
                label="Имя пользователя"
                rules={[
                    {
                        required: true,
                        message: 'Пожалуйста, введите имя пользователя!',
                    },
                ]}
                hasFeedback>
                <Input />
            </Form.Item>

            <Form.Item
                name="password"
                label="Пароль"
                rules={[
                    {
                        required: true,
                        message: 'Пожалуйста, введите пароль!',
                    },
                ]}
                hasFeedback>
                <Input.Password />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Логин
                </Button>
            </Form.Item>
        </Form>
        <div>{msg}</div>
    </>)
}

export default LoginPage