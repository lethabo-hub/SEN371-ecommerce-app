using ecommerceApp.Data;
using ecommerceApp.DBEntities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace ecommerceApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderItemsController : ControllerBase
    {
        private readonly IMongoCollection<OrderItems>? _orderItem;

        public OrderItemsController(MongoDBService mongoDBService)
        {
            if (mongoDBService.Database != null)
            {
                _orderItem = mongoDBService.Database.GetCollection<OrderItems>("orderItem");
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderItems>>> Get()
        {
            if (_orderItem == null) return StatusCode(500, "Database connection not ready");

            return await _orderItem.Find(FilterDefinition<OrderItems>.Empty).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OrderItems>> GetById(string id)
        {
            if (_orderItem == null) return StatusCode(500, "Database connection not ready");

            var filter = Builders<OrderItems>.Filter.Eq(x => x.OrderItemId, id);
            var orderItem = await _orderItem.Find(filter).FirstOrDefaultAsync();

            return orderItem is not null ? Ok(orderItem) : NotFound();
        }

        [HttpGet("order/{orderId}")]
        public async Task<ActionResult<IEnumerable<OrderItems>>> GetByOrderId(string orderId)
        {
            if (_orderItem == null) return StatusCode(500, "Database connection not ready");

            var filter = Builders<OrderItems>.Filter.Eq(x => x.OrderId, orderId);
            var orderItems = await _orderItem.Find(filter).ToListAsync();

            return Ok(orderItems);
        }

        [HttpPost]
        public async Task<ActionResult> CreateOrderItem(OrderItems orderItem)
        {
            if (_orderItem == null) return StatusCode(500, "Database connection not ready");

            await _orderItem.InsertOneAsync(orderItem);
            return CreatedAtAction(nameof(GetById), new { id = orderItem.OrderItemId }, orderItem);
        }

        [HttpPut]
        public async Task<ActionResult> UpdateOrderItem(OrderItems orderItem)
        {
            if (_orderItem == null) return StatusCode(500, "Database connection not ready");

            var filter = Builders<OrderItems>.Filter.Eq(x => x.OrderItemId, orderItem.OrderItemId);
            await _orderItem.ReplaceOneAsync(filter, orderItem);

            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            if (_orderItem == null) return StatusCode(500, "Database connection not ready");

            var filter = Builders<OrderItems>.Filter.Eq(x => x.OrderItemId, id);
            await _orderItem.DeleteOneAsync(filter);

            return Ok();
        }
    }
}
