using ecommerceApp.Data;
using ecommerceApp.DBEntities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace ecommerceApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartItemController : ControllerBase
    {
        private readonly IMongoCollection<CartItems>? _cartItem;

        public CartItemController(MongoDBService mongoDBService)
        {
            if (mongoDBService.Database != null)
            {
                _cartItem = mongoDBService.Database.GetCollection<CartItems>("cartItem");
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CartItems>>> Get()
        {
            if (_cartItem == null) return StatusCode(500, "Database connection not ready");

            return await _cartItem.Find(FilterDefinition<CartItems>.Empty).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CartItems>> GetById(string id)
        {
            if (_cartItem == null) return StatusCode(500, "Database connection not ready");

            var filter = Builders<CartItems>.Filter.Eq(x => x.CartItemId, id);
            var cartItem = await _cartItem.Find(filter).FirstOrDefaultAsync();

            return cartItem is not null ? Ok(cartItem) : NotFound();
        }

        [HttpGet("cart/{cartId}")]
        public async Task<ActionResult<IEnumerable<CartItems>>> GetByCartId(string cartId)
        {
            if (_cartItem == null) return StatusCode(500, "Database connection not ready");

            var filter = Builders<CartItems>.Filter.Eq(x => x.CartId, cartId);
            var cartItems = await _cartItem.Find(filter).ToListAsync();

            return Ok(cartItems);
        }

        [HttpPost]
        public async Task<ActionResult> CreateCartItem(CartItems cartItem)
        {
            if (_cartItem == null) return StatusCode(500, "Database connection not ready");

            await _cartItem.InsertOneAsync(cartItem);
            return CreatedAtAction(nameof(GetById), new { id = cartItem.CartItemId }, cartItem);
        }

        [HttpPut]
        public async Task<ActionResult> UpdateCartItem(CartItems cartItem)
        {
            if (_cartItem == null) return StatusCode(500, "Database connection not ready");

            var filter = Builders<CartItems>.Filter.Eq(x => x.CartItemId, cartItem.CartItemId);
            await _cartItem.ReplaceOneAsync(filter, cartItem);

            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            if (_cartItem == null) return StatusCode(500, "Database connection not ready");

            var filter = Builders<CartItems>.Filter.Eq(x => x.CartItemId, id);
            await _cartItem.DeleteOneAsync(filter);

            return Ok();
        }
    }
}
