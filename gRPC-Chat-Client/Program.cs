using System.Text.Json;
using gRPC_Chat_Server;
using Grpc.Core;
using Grpc.Net.Client;

var channel = GrpcChannel.ForAddress("http://localhost:5155");
var client = new Chat.ChatClient(channel);

using var res = client.Join(new JoinRequest(), new Metadata
{
    {
        "Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IlF3ZXJ0eSIsImV4cCI6MTcwOTQ5OTM0NCwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo1MjcwIiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDo1MjcwIn0.FQ5zp1yd05htMmTTapBP85y4KuLkbIkPDaiui6SKqgg"
    }
});
while (await res.ResponseStream.MoveNext())
{
    var cur = res.ResponseStream.Current;
    Console.WriteLine(JsonSerializer.Serialize(cur));
}
Console.WriteLine(res);
