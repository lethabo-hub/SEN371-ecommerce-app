using ecommerceApp.Data;
using ecommerceApp.DBEntities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;


namespace ecommerceApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewController : ControllerBase
    {
        private readonly IMongoCollection<Review>? _review;

        public ReviewController(MongoDBService mongoDBService)
        {
            if (mongoDBService.Database != null)
            {
                _review = mongoDBService.Database.GetCollection<Review>("review");
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Review>>> Get()
        {
            if (_review == null) return StatusCode(500, "Database connection not ready");

            return await _review.Find(FilterDefinition<Review>.Empty).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Review>> GetById(string id)
        {
            if (_review == null) return StatusCode(500, "Database connection not ready");

            var filter = Builders<Review>.Filter.Eq(x => x.Id, id);
            var review = await _review.Find(filter).FirstOrDefaultAsync();

            return review is not null ? Ok(review) : NotFound();
        }

        [HttpPost]
        public async Task<ActionResult> CreateReview(Review review)
        {
            if (_review == null) return StatusCode(500, "Database connection not ready");

            await _review.InsertOneAsync(review);
            return CreatedAtAction(nameof(GetById), new { id = review.Id }, review);
        }

        [HttpPut]
        public async Task<ActionResult> UpdateReview(Review review)
        {
            if (_review == null) return StatusCode(500, "Database connection not ready");

            var filter = Builders<Review>.Filter.Eq(x => x.Id, review.Id);
            await _review.ReplaceOneAsync(filter, review);

            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            if (_review == null) return StatusCode(500, "Database connection not ready");

            var filter = Builders<Review>.Filter.Eq(x => x.Id, id);
            await _review.DeleteOneAsync(filter);

            return Ok();
        }
    }
}
