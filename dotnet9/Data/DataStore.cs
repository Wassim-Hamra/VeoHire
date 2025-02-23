using System.Collections.Concurrent;
using dotnet9.Models;

namespace dotnet9.Data
{
    public static class DataStore
    {
        private static readonly ConcurrentBag<Candidate> _candidates = [];
        public static IReadOnlyCollection<Candidate> Candidates => _candidates;
        public static void AddCandidate(Candidate candidate) => _candidates.Add(candidate);
    }
}