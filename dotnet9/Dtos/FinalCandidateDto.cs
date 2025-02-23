using System.Text.Json.Nodes;

namespace dotnet9.Dtos{
     public class FinalCandidateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public float Score { get; set; }   // Response from predict
    }
}