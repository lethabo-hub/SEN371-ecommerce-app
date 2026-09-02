using ecommerceApp.Data;
using ecommerceApp.DBEntities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace ecommerceApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IMongoCollection<Order>? _order;

        public OrderController(MongoDBService mongoDBService)
        {
            if (mongoDBService.Database != null)
            {
                _order = mongoDBService.Database.GetCollection<Order>("order");
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> Get()
        {
            if (_order == null) return StatusCode(500, "Database connection not ready");

            return await _order.Find(FilterDefinition<Order>.Empty).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetById(string id)
        {
            if (_order == null) return StatusCode(500, "Database connection not ready");

            var filter = Builders<Order>.Filter.Eq(x => x.OrderId, id);
            var order = await _order.Find(filter).FirstOrDefaultAsync();

            return order is not null ? Ok(order) : NotFound();
        }

        [HttpPost]
        public async Task<ActionResult> CreateOrder(Order order)
        {
            if (_order == null) return StatusCode(500, "Database connection not ready");

            await _order.InsertOneAsync(order);
            return CreatedAtAction(nameof(GetById), new { id = order.OrderId }, order);
        }

        [HttpPut]
        public async Task<ActionResult> UpdateOrder(Order order)
        {
            if (_order == null) return StatusCode(500, "Database connection not ready");

            var filter = Builders<Order>.Filter.Eq(x => x.OrderId, order.OrderId);
            await _order.ReplaceOneAsync(filter, order);

            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            if (_order == null) return StatusCode(500, "Database connection not ready");

            var filter = Builders<Order>.Filter.Eq(x => x.OrderId, id);
            await _order.DeleteOneAsync(filter);

            return Ok();
        }
    }
}
