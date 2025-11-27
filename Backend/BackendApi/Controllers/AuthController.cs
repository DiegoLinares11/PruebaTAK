using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;

namespace BackendApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;

        public AuthController(IConfiguration config)
        {
            _config = config;
        }

        //  Método GET que devuelva un token (10 mins de vida)
        [HttpGet("GenerarToken")]
        public IActionResult GenerarToken()
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            // Creamos los "Claims" (datos del carnet)
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "UsuarioPrueba"),
                new Claim(ClaimTypes.Email, "prueba@tak.com")
            };

            // Creamos el token
            var token = new JwtSecurityToken(
                _config["Jwt:Issuer"],
                _config["Jwt:Audience"],
                claims,
                expires: DateTime.Now.AddMinutes(10), // Vence en 10 minutos
                signingCredentials: credentials);

            return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
        }

        //  Método que valide si el token sigue vigente
        // [Authorize] Solo entra quien tenga token válido.
        [HttpGet("ValidarToken")]
        [Authorize]
        public IActionResult ValidarToken()
        {
            return Ok("El token es válido y estás autorizado. ✅");
        }
    }
}