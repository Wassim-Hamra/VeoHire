
using System.ComponentModel.DataAnnotations;

namespace dotnet9.Dtos{
    public class CvDto
    {
        [Required]
        public string cv_text { get; set; } = string.Empty;
    }

}