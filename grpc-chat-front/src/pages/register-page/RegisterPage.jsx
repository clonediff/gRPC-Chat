import {Button, Form, Input} from "antd";
import {AuthorizationJwtName, GrpcAuthClient} from "../../contstants";
import {RegisterDto} from "../../Protos/auth_pb"
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

const RegisterPage = ({handleAuth}) => {
    const [form] = Form.useForm()
    const [msg, setMsg] = useState('')
    const navigate = useNavigate()
    useEffect(() => {
        handleAuth()
        if (localStorage.getItem(AuthorizationJwtName)) 
            navigate('/')
    }, []);
    
    const onFinish = (values) => {
        const registerDto = new RegisterDto();
        registerDto.setUsername(values.username);
        registerDto.setPassword(values.password);
        registerDto.setRepeatpassword(values.confirm);
        GrpcAuthClient.register(registerDto, null, (error, response) => {
            if (error) return console.log(error);
            if (response.getIssuccess()) {
                localStorage.setItem(AuthorizationJwtName, `Bearer ${response.getJwt()}`);
                navigate('/');
            } else
                setMsg(response.getErrormessage())
        });
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

            <Form.Item
                name="confirm"
                label="Подтвердите пароль"
                dependencies={['password']}
                hasFeedback
                rules={[
                    {
                        required: true,
                        message: 'Пожалуйста, подтвердите пароль!',
                    },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Пароли должны совпадать!'));
                        },
                    }),
                ]}>
                <Input.Password />
            </Form.Item>
            
            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Регистрация
                </Button>
            </Form.Item>
        </Form>
        <div>{msg}</div>
    </>)
}

export default RegisterPage