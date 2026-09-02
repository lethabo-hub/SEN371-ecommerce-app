using ecommerceApp.Data;
using ecommerceApp.DBEntities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace ecommerceApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IMongoCollection<Payment>? _payment;

        public PaymentController(MongoDBService mongoDBService)
        {
            if (mongoDBService.Database != null)
            {
                _payment = mongoDBService.Database.GetCollection<Payment>("payment");
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Payment>>> Get()
        {
            if (_payment == null) return StatusCode(500, "Database connection not ready");

            return await _payment.Find(FilterDefinition<Payment>.Empty).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Payment>> GetById(string id)
        {
            if (_payment == null) return StatusCode(500, "Database connection not ready");

            var filter = Builders<Payment>.Filter.Eq(x => x.PaymentId, id);
            var payment = await _payment.Find(filter).FirstOrDefaultAsync();

            return payment is not null ? Ok(payment) : NotFound();
        }

        [HttpPost]
        public async Task<ActionResult> CreatePayment(Payment payment)
        {
            if (_payment == null) return StatusCode(500, "Database connection not ready");

            await _payment.InsertOneAsync(payment);
            return CreatedAtAction(nameof(GetById), new { id = payment.PaymentId }, payment);
        }

        [HttpPut]
        public async Task<ActionResult> UpdatePayment(Payment payment)
        {
            if (_payment == null) return StatusCode(500, "Database connection not ready");

            var filter = Builders<Payment>.Filter.Eq(x => x.PaymentId, payment.PaymentId);
            await _payment.ReplaceOneAsync(filter, payment);

            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            if (_payment == null) return StatusCode(500, "Database connection not ready");

            var filter = Builders<Payment>.Filter.Eq(x => x.PaymentId, id);
            await _payment.DeleteOneAsync(filter);

            return Ok();
        }
    }
}
