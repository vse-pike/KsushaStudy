using Microsoft.EntityFrameworkCore;
using SSO.DAL.Models;

namespace SSO.DAL;

public class ApplicationContext : DbContext
{
    public DbSet<UserModel> Users { get; set; } = null!;
    public DbSet<TokenModel> Tokens { get; set; } = null!;

    public ApplicationContext(DbContextOptions<ApplicationContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserModel>()
            .HasOne(u => u.TokenModel)
            .WithOne(t => t.UserModel)
            .HasForeignKey<TokenModel>(t => t.UserId);

        base.OnModelCreating(modelBuilder);
    }
}