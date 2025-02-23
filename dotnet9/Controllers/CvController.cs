using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using dotnet9.Data;
using dotnet9.Dtos;
using dotnet9.Models;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Nodes;

namespace dotnet9.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class CvController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        
        public CvController(IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClientFactory.CreateClient();
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadCvs([FromBody] CvDto cvs)
        {
            if (cvs == null || string.IsNullOrWhiteSpace(cvs.cv_text))
                return BadRequest("Invalid payload.");

            try
            {
                var payload = new { cv_text = cvs.cv_text };
                var response = await _httpClient.PostAsJsonAsync("http://127.0.0.1:8000/getInfo", payload);
                
                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    
                    // Parse as JsonNode which can handle any JSON structure
                    var jsonNode = JsonNode.Parse(responseContent);
                    DataStore.AddCandidate(new Candidate{candidateJsonString = responseContent});
                    
                    // Just pass through the parsed JSON
                    return Ok(jsonNode);
                }

                return StatusCode((int)response.StatusCode, "Failed to process CV");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
