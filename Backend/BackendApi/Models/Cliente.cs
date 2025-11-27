using System.Diagnostics.Contracts;
using System.Text.Json.Serialization; 

namespace BackendApi.Models
{
    public class Cliente
    {
        public int ClienteId { get; set; }
        public string NombreCliente { get; set; } = string.Empty;
        public string Direccion { get; set; } = string.Empty;
        public string Pais { get; set; } = string.Empty;
        public string Identificador { get; set; } = string.Empty; // NIT 
        public DateTime FechaCreacion { get; set; }
        public string TelefonoPrincipal { get; set; } = string.Empty;
        public string CorreoElectronico { get; set; } = string.Empty;

        // Un Cliente tiene muchos Contactos
        public ICollection<Contacto>? Contactos { get; set; }
    }
}