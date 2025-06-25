using System.ComponentModel.DataAnnotations;

namespace infraops_backend.Models
{
    public class Subscription
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Provider { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal MonthlyCost { get; set; }
        public DateTime RenewalDate { get; set; } = DateTime.UtcNow;
        public string Owner { get; set; } = "";
        public string Category { get; set; } = "";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
