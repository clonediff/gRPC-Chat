using System.Collections.Concurrent;
using System.Security.Claims;
using gRPC_Chat_Server.Entities;
using Grpc.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace gRPC_Chat_Server.Services;

[Authorize]
public class ChatService : Chat.ChatBase
{
    private static readonly ConcurrentDictionary<string, HashSet<IServerStreamWriter<ChatMessage>>> UserStreams = [];

    private readonly DbContext _dbContext;

    public ChatService(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public override async Task Join(JoinRequest request, IServerStreamWriter<ChatMessage> responseStream, ServerCallContext context)
    {
        var username = GetUsername(context);
        if (username is null ||
            await _dbContext.Set<User>().FirstOrDefaultAsync(x => x.Username == username) is null)
            throw new RpcException(new Status(StatusCode.Unauthenticated, "Current session is incorrect"));
        foreach (var message in _dbContext.Set<Entities.ChatMessage>().Include(x => x.User))
            await responseStream.WriteAsync(new ChatMessage
            {
                Message = message.Message,
                Username = message.User?.Username ?? ""
            });
        if (UserStreams.TryAdd(username, []))
        {
            var joinMsg = new ChatMessage {Message = $"{username} joined to chat"};
            await SendMessage(joinMsg, context);
            await responseStream.WriteAsync(joinMsg);
        }

        UserStreams[username].Add(responseStream);
        while (!context.CancellationToken.IsCancellationRequested) { }

        UserStreams[username].Remove(responseStream);
        if (UserStreams[username].Count == 0)
        {
            UserStreams.Remove(username, out _);
            await SendMessage(new ChatMessage {Message = $"{username} left the chat"}, context);
        }
    }

    public override async Task<SendStatus> SendMessage(ChatMessage request, ServerCallContext context)
    {
        if (string.IsNullOrEmpty(request.Message.Trim()))
            return new SendStatus {Success = false};
        var username = GetUsername(context);
        if (username is null)
            throw new RpcException(new Status(StatusCode.Unauthenticated, "Current session is incorrect"));
        var user = await _dbContext.Set<User>().FirstOrDefaultAsync(x => x.Username == username);
        if (user  is null)
            throw new RpcException(new Status(StatusCode.Unauthenticated, "Current session is incorrect"));
        var chatMessage = new Entities.ChatMessage
        {
            Message = request.Message
        };
        
        if (request.FillUsername)
        {
            request.Username = user.Username;
            chatMessage.User = user;
        }
        _dbContext.Set<Entities.ChatMessage>().Add(chatMessage);
        await _dbContext.SaveChangesAsync();

        foreach (var (_, streams) in UserStreams)
        foreach (var stream in streams)
            await stream.WriteAsync(request);
        return new SendStatus {Success = true};
    }

    private string? GetUsername(ServerCallContext context)
        => context.GetHttpContext().User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
}