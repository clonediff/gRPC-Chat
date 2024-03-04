using gRPC_Chat_Server.Entities;
using Microsoft.EntityFrameworkCore;

namespace gRPC_Chat_Server.DataAccess;

public class GrpcChatDbContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Entities.ChatMessage> Messages { get; set; }
    
    public GrpcChatDbContext(DbContextOptions<GrpcChatDbContext> options) : base(options)
    { }
}