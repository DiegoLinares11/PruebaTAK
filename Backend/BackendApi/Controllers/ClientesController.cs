using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackendApi.Context;
using BackendApi.Models;

namespace BackendApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ClientesController(AppDbContext context)
        {
            _context = context;
        }

        // 1. GET: api/Clientes (Trae TODOS los clientes y sus contactos)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cliente>>> GetClientes()
        {
            return await _context.Clientes
                                 .Include(c => c.Contactos) //  esto para traer los hijos
                                 .ToListAsync();
        }

        // 2. GET: api/Clientes/5 traer por ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Cliente>> GetCliente(int id)
        {
            var cliente = await _context.Clientes
                                        .Include(c => c.Contactos)
                                        .FirstOrDefaultAsync(c => c.ClienteId == id);

            if (cliente == null)
            {
                return NotFound();
            }

            return cliente;
        }

        // 3. api/Clientes crear clientes y contactos
        [HttpPost]
        public async Task<ActionResult<Cliente>> PostCliente(Cliente cliente)
        {
            //  Si el JSON trae contactos, los guarda en la tabla Contactos automáticamente
            cliente.FechaCreacion = DateTime.Now;

            // Si la lista de contactos viene nula, la inicializamos vacía para evitar errores
            if (cliente.Contactos == null) cliente.Contactos = new List<Contacto>();
            _context.Clientes.Add(cliente);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCliente", new { id = cliente.ClienteId }, cliente);
        }

        // 4.  api/Clientes/5 updater cliente
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCliente(int id, Cliente cliente)
        {
            if (id != cliente.ClienteId) return BadRequest();

            _context.Entry(cliente).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Clientes.Any(e => e.ClienteId == id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        // 5. api/Clientes/5 delete cliente
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCliente(int id)
        {
            //  Buscamos al cliente INCLUYENDO sus contactos
            var cliente = await _context.Clientes
                                        .Include(c => c.Contactos) 
                                        .FirstOrDefaultAsync(c => c.ClienteId == id);

            if (cliente == null) return NotFound();

            // Si tiene contactos, los borramos primero manualmente
            if (cliente.Contactos != null && cliente.Contactos.Count > 0)
            {
                _context.Contactos.RemoveRange(cliente.Contactos);
            }

            //Ahora sí, borramos al papá libremente
            _context.Clientes.Remove(cliente);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}