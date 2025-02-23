
using System.ComponentModel.DataAnnotations;

namespace dotnet9.Dtos{
    public class CandidateDto
    {
        public string Name { get; set; } = string.Empty;
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }

}