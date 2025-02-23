using dotnet9.Dtos;
using dotnet9.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace dotnet9.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class EmailController : ControllerBase
    {
        private readonly IEmailService _emailService;

        public EmailController(IEmailService emailService)
        {
            _emailService = emailService;
        }

        [HttpPost("accepted")]
        public async Task<IActionResult> SendAcceptedEmail([FromBody] CandidateDto candidate)
        {
            if (string.IsNullOrEmpty(candidate?.Email))
                return BadRequest("Email is invalid");

            string subject = "Hiring Request - Congratulations!";
            string htmlContent = $@"
                <html>
                  <body>
                    <h1>Congratulations, {candidate.Name}!</h1>
                    <p>We are excited to inform you that your application has been successful.</p>
                    <p>Please await further instructions regarding the next steps.</p>
                    <br/>
                    <p>Best regards,<br/>The Hiring Team</p>
                  </body>
                </html>";

            try
            {
                await _emailService.SendEmailAsync(candidate.Email, subject, htmlContent);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error sending email: " + ex.Message);
            }

            return Ok(new { message = "Accepted email sent successfully." });
        }

        [HttpPost("rejected")]
        public async Task<IActionResult> SendRejectedEmail([FromBody] CandidateDto candidate)
        {
            if (string.IsNullOrEmpty(candidate?.Email))
                return BadRequest("Email is invalid");

            string subject = "Hiring Request - Application Update";
            string htmlContent = $@"
                <html>
                  <body>
                    <h1>Hello {candidate.Name},</h1>
                    <p>Thank you for your interest in joining our team.</p>
                    <p>After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.</p>
                    <p>We appreciate the time and effort you invested in your application and wish you all the best for your future endeavors.</p>
                    <br/>
                    <p>Sincerely,<br/>The Hiring Team</p>
                  </body>
                </html>";

            try
            {
                await _emailService.SendEmailAsync(candidate.Email, subject, htmlContent);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error sending email: " + ex.Message);
            }

            return Ok(new { message = "Rejected email sent successfully." });
        }
    }
}
