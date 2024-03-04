import {AuthClient} from './Protos/auth_grpc_web_pb'
import {ChatClient} from './Protos/chat_grpc_web_pb'

export const GrpcUri = "http://localhost:8080";
export const GrpcAuthClient = new AuthClient(GrpcUri);
export const GrpcChatClient = new ChatClient(GrpcUri);
export const AuthorizationJwtName = "Authorization"
