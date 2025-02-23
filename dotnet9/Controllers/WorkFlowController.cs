using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using dotnet9.Dtos;

namespace dotnet9.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class WorkflowController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        public WorkflowController(IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClientFactory.CreateClient();
        }

        [HttpPost("start")]
        public async Task<IActionResult> ProcessCvWorkflow([FromBody] CvDto cvs)
        {
            if (cvs == null || string.IsNullOrWhiteSpace(cvs.cv_text))
                return BadRequest("Invalid payload.");

            try
            {
                // Step 1: Send cv_text to first API (getInfo)
                var payload1 = new { cv_text = cvs.cv_text };
                var response1 = await _httpClient.PostAsJsonAsync("http://127.0.0.1:8000/getInfo", payload1);
                if (!response1.IsSuccessStatusCode)
                    return StatusCode((int)response1.StatusCode, "Failed at getInfo");

                var responseContent1 = await response1.Content.ReadAsStringAsync();
                var jsonResponse1 = JsonNode.Parse(responseContent1);

                Console.Write(jsonResponse1);

                // Extract candidate basic info from first API response
                var answerNode = jsonResponse1?["answer"];
                if (answerNode == null)
                    return StatusCode(500, "Invalid structure from getInfo");

                // For example, assume the basic info is structured as follows:
                // { "name": "Alouani Mohamed Ali", "contact_info": { "email": "...", "phone": "..." } }
                string candidateName = answerNode["contact_info"]?["name"]?.ToString()
                                        ?? answerNode["Contact Information"]?["Name"]?.ToString()
                                        ?? "";
                string candidateEmail = answerNode["contact_info"]?["email"]?.ToString()
                                        ?? answerNode["Contact Information"]?["Email"]?.ToString()
                                        ?? "";
                // Use phone if available; otherwise, use address
                string candidatePhone = answerNode["contact_info"]?["phone"]?.ToString() 
                                        ??answerNode["Contact Information"]?["Phone"]?.ToString()
                                        ?? answerNode["Contact Information"]?["Address"]?.ToString()
                                        ?? answerNode["contact_info"]?["address"]?.ToString()
                                        ?? "";


                // Step 2: Forward the entire first response to second API (getMLinfo)
                var response2 = await _httpClient.PostAsJsonAsync("http://127.0.0.1:8001/getMLinfo", jsonResponse1);
                if (!response2.IsSuccessStatusCode)
                    return StatusCode((int)response2.StatusCode, "Failed at getMLinfo");

                var responseContent2 = await response2.Content.ReadAsStringAsync();
                var jsonResponse2 = JsonNode.Parse(responseContent2);

                Console.Write(jsonResponse2);

                // Step 3: Forward second API's response to third API (predict)
                var response3 = await _httpClient.PostAsJsonAsync("http://127.0.0.1:8002/predict", jsonResponse2);
                if (!response3.IsSuccessStatusCode)
                    return StatusCode((int)response3.StatusCode, "Failed at predict");

                var responseContent3 = await response3.Content.ReadAsStringAsync();
                var jsonResponse3 = JsonNode.Parse(responseContent3);

                Console.Write(jsonResponse3);

                // Combine all responses into a final DTO to send to the frontend
                return Ok(new FinalCandidateDto
                {
                    Name = candidateName,
                    Email = candidateEmail,
                    Phone = candidatePhone,
                    Score = (float)(jsonResponse3?["probability_of_acceptance"] ?? 0.0),  // from third API
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
