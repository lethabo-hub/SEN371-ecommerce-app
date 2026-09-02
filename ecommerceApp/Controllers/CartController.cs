using ecommerceApp.Data;
using ecommerceApp.DBEntities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace ecommerceApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly IMongoCollection<Cart>? _cart;

        public CartController(MongoDBService mongoDBService)
        {
            if (mongoDBService.Database != null)
            {
                _cart = mongoDBService.Database.GetCollection<Cart>("cart");
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cart>>> Get()
        {
            if (_cart == null) return StatusCode(500, "Database connection not ready");

            return await _cart.Find(FilterDefinition<Cart>.Empty).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Cart>> GetById(string id)
        {
            if (_cart == null) return StatusCode(500, "Database connection not ready");

            var filter = Builders<Cart>.Filter.Eq(x => x.CartId, id);
            var cart = await _cart.Find(filter).FirstOrDefaultAsync();

            return cart is not null ? Ok(cart) : NotFound();
        }

        [HttpPost]
        public async Task<ActionResult> CreateCart(Cart cart)
        {
            if (_cart == null) return StatusCode(500, "Database connection not ready");

            await _cart.InsertOneAsync(cart);
            return CreatedAtAction(nameof(GetById), new { id = cart.CartId }, cart);
        }

        [HttpPut]
        public async Task<ActionResult> UpdateCart(Cart cart)
        {
            if (_cart == null) return StatusCode(500, "Database connection not ready");

            var filter = Builders<Cart>.Filter.Eq(x => x.CartId, cart.CartId);
            await _cart.ReplaceOneAsync(filter, cart);

            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            if (_cart == null) return StatusCode(500, "Database connection not ready");

            var filter = Builders<Cart>.Filter.Eq(x => x.CartId, id);
            await _cart.DeleteOneAsync(filter);

            return Ok();
        }
    }
}
