using infraops_backend.Data;
using infraops_backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace infraops_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubscriptionsController : ControllerBase
    {
        private readonly InfraOpsDbContext _context;
        public SubscriptionsController(InfraOpsDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Subscription>>> GetSubscriptions()
        {
            return await _context.Subscriptions.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Subscription>> GetSubscription(int id)
        {
            var subscription = await _context.Subscriptions.FindAsync(id);
            if (subscription == null) return NotFound();
            return subscription;
        }

        [HttpPost]
        public async Task<ActionResult<Subscription>> CreateSubscription(Subscription subscription)
        {
            // Ensure all DateTime fields are set to UTC
            subscription.RenewalDate = DateTime.SpecifyKind(subscription.RenewalDate, DateTimeKind.Utc);
            subscription.CreatedAt = DateTime.SpecifyKind(subscription.CreatedAt, DateTimeKind.Utc);
            _context.Subscriptions.Add(subscription);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetSubscription), new { id = subscription.Id }, subscription);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSubscription(int id, Subscription subscription)
        {
            if (id != subscription.Id) return BadRequest();
            _context.Entry(subscription).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSubscription(int id)
        {
            var subscription = await _context.Subscriptions.FindAsync(id);
            if (subscription == null) return NotFound();
            _context.Subscriptions.Remove(subscription);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("seed")]
        public async Task<IActionResult> Seed()
        {
            if (await _context.Subscriptions.AnyAsync())
                return BadRequest("Database already seeded.");

            var subscriptions = new List<Subscription>
            {
                new Subscription { Name = "Netflix", Provider = "Netflix", Status = "Active", MonthlyCost = 15.99M, RenewalDate = DateTime.UtcNow.AddMonths(1), Owner = "John Doe", Category = "Entertainment" },
                new Subscription { Name = "Spotify", Provider = "Spotify", Status = "Active", MonthlyCost = 9.99M, RenewalDate = DateTime.UtcNow.AddMonths(1), Owner = "John Doe", Category = "Music" },
                new Subscription { Name = "AWS Free Tier", Provider = "Amazon Web Services", Status = "Trial", MonthlyCost = 0.00M, RenewalDate = DateTime.UtcNow.AddMonths(1), Owner = "John Doe", Category = "Cloud" },
                new Subscription { Name = "Notion", Provider = "Notion", Status = "Active", MonthlyCost = 4.00M, RenewalDate = DateTime.UtcNow.AddMonths(1), Owner = "John Doe", Category = "Productivity" }
            };
            _context.Subscriptions.AddRange(subscriptions);
            await _context.SaveChangesAsync();
            return Ok(subscriptions);
        }

        [HttpPost("upload-csv")]
        public async Task<IActionResult> UploadCsv(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var subscriptions = new List<Subscription>();
            using (var stream = new StreamReader(file.OpenReadStream()))
            {
                string? headerLine = await stream.ReadLineAsync(); // skip header
                while (!stream.EndOfStream)
                {
                    var line = await stream.ReadLineAsync();
                    if (string.IsNullOrWhiteSpace(line)) continue;
                    var parts = line.Split(',');
                    if (parts.Length < 7) continue;
                    subscriptions.Add(new Subscription
                    {
                        Name = parts[0],
                        Provider = parts[1],
                        Status = parts[2],
                        MonthlyCost = decimal.TryParse(parts[3], out var cost) ? cost : 0,
                        RenewalDate = DateTime.TryParse(parts[4], out var renewal) ? renewal : DateTime.UtcNow,
                        Owner = parts[5],
                        Category = parts[6],
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }
            _context.Subscriptions.AddRange(subscriptions);
            await _context.SaveChangesAsync();
            return Ok(new { count = subscriptions.Count });
        }
    }
}
