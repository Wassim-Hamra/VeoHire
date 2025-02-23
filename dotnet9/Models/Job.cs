namespace dotnet9.Models{
    public class Job
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Requirements { get; set; } = string.Empty;
        public List<string> Keywords { get; set; } = [];
        public string Description { get; set; } = string.Empty;
    }
}