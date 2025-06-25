using Microsoft.EntityFrameworkCore;
using infraops_backend.Models;

namespace infraops_backend.Data
{
    public class InfraOpsDbContext : DbContext
    {
        public InfraOpsDbContext(DbContextOptions<InfraOpsDbContext> options) : base(options) { }

        public DbSet<Subscription> Subscriptions { get; set; }
    }
}
