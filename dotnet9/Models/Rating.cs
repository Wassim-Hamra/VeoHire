namespace dotnet9.Models{
    public class Rating
    {
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public List<string> Pros { get; set; } = [];
        public List<string> Cons { get; set; } = [];
        public float Score { get; set; }
    }
}