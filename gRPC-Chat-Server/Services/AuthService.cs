using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using gRPC_Chat_Server.Entities;
using Grpc.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace gRPC_Chat_Server.Services;

public class AuthService : Auth.AuthBase
{
    private readonly IConfiguration _configuration;
    private readonly DbContext _dbContext;

    public AuthService(IConfiguration configuration, DbContext dbContext)
    {
        _configuration = configuration;
        _dbContext = dbContext;
    }

    public override async Task<JwtResponse> Register(RegisterDto request, ServerCallContext context)
    {
        if (string.IsNullOrEmpty(request.Username.Trim()) || string.IsNullOrEmpty(request.Password.Trim()) ||
            string.IsNullOrEmpty(request.RepeatPassword.Trim()))
            return new JwtResponse
            {
                IsSuccess = false,
                ErrorMessage = "All fields should be not empty"
            };
        if (request.Password != request.RepeatPassword)
            return new JwtResponse
            {
                IsSuccess = false,
                ErrorMessage = $"Password must be equal to Repeat Password"
            };
        var user = await _dbContext.Set<User>()
            .FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user is not null)
            return new JwtResponse
            {
                IsSuccess = false,
                ErrorMessage = $"User {request.Username} already exists"
            };

        _dbContext.Set<User>().Add(new User
        {
            Username = request.Username,
            Password = request.Password
        });
        await _dbContext.SaveChangesAsync();
        return new JwtResponse
        {
            IsSuccess = true,
            Jwt = GenerateToken(request.Username)
        };
    }

    public override async Task<JwtResponse> Login(LoginDto request, ServerCallContext context)
    {
        if (string.IsNullOrEmpty(request.Username.Trim()) || string.IsNullOrEmpty(request.Password.Trim()))
            return new JwtResponse
            {
                IsSuccess = false,
                ErrorMessage = "All fields should be not empty"
            };
        
        var user = await _dbContext.Set<User>()
            .FirstOrDefaultAsync(u => u.Username == request.Username);

        if (user is null || user.Password != request.Password)
            return new JwtResponse  
            {
                IsSuccess = false,
                ErrorMessage = "Username or password is incorrect"
            };

        return new JwtResponse
        {
            IsSuccess = true,
            Jwt = GenerateToken(request.Username)
        };
    }
    
    private string GenerateToken(string username)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier,username),
        };
        var token = new JwtSecurityToken(_configuration["Jwt:Issuer"],
            _configuration["Jwt:Audience"],
            claims,
            expires: DateTime.Now.AddHours(2),
            signingCredentials: credentials);


        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}