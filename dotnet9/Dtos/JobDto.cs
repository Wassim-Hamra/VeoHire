using System.ComponentModel.DataAnnotations;

namespace dotnet9.Dtos
{
    public class JobDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        public List<string> Keywords { get; set; } = [];
        public string Description { get; set; } = string.Empty;
        public List<string> Requirements { get; set; } = [];
    }
}