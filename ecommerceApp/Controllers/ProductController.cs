using ecommerceApp.Data;
using ecommerceApp.DBEntities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace ecommerceApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IMongoCollection<Product>? _product;

        public ProductController(MongoDBService mongoDBService)
        {
            if (mongoDBService.Database != null)
            {
                _product = mongoDBService.Database.GetCollection<Product>("product");
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> Get()
        {
            if (_product == null) return StatusCode(500, "Database connection not ready");

            return await _product.Find(FilterDefinition<Product>.Empty).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetById(string id)
        {
            if (_product == null) return StatusCode(500, "Database connection not ready");

            var filter = Builders<Product>.Filter.Eq(x => x.ProductId, id);
            var product = await _product.Find(filter).FirstOrDefaultAsync();

            return product is not null ? Ok(product) : NotFound();
        }

        [HttpPost]
        public async Task<ActionResult> CreateProduct(Product product)
        {
            if (_product == null) return StatusCode(500, "Database connection not ready");

            await _product.InsertOneAsync(product);
            return CreatedAtAction(nameof(GetById), new { id = product.ProductId }, product);
        }

        [HttpPut]
        public async Task<ActionResult> UpdateProduct(Product product)
        {
            if (_product == null) return StatusCode(500, "Database connection not ready");

            var filter = Builders<Product>.Filter.Eq(x => x.ProductId, product.ProductId);
            await _product.ReplaceOneAsync(filter, product);

            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            if (_product == null) return StatusCode(500, "Database connection not ready");

            var filter = Builders<Product>.Filter.Eq(x => x.ProductId, id);
            await _product.DeleteOneAsync(filter);

            return Ok();
        }
    }
}
