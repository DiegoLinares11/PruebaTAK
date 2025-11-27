using BackendApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BackendApi.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
    }
        public DbSet<Cliente> Clientes { get; set; }
        public DbSet<Contacto> Contactos { get; set; }

    }
}