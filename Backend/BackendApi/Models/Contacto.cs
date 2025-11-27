using System.Text.Json.Serialization;

namespace BackendApi.Models
{
    public class Contacto
    {
        public int ContactoId { get; set; }

        //fk
        public int ClienteId { get; set; }

        public string NombreContacto { get; set; } = string.Empty;
        public string Puesto { get; set; } = string.Empty;
        public string TelefonoContacto { get; set; } = string.Empty;
        public string EmailContacto { get; set; } = string.Empty;

        // Un Contacto pertenece a un Cliente
        // El JsonIgnore evita que al pedir un contacto se traiga recursivamente al cliente entero
        [JsonIgnore]
        public Cliente? Cliente { get; set; }
    }
}