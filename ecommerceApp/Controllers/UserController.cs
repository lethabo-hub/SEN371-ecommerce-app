using ecommerceApp.Data;
using ecommerceApp.DBEntities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace ecommerceApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IMongoCollection<User>? _user;
        public UserController(MongoDBService mongoDBService) 
        {
            if (mongoDBService.Database != null)
            {
                _user = mongoDBService.Database?.GetCollection<User>("user");
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> Get()
        {
            return await _user.Find(FilterDefinition<User>.Empty).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetById(string id)
        {
            var filter = Builders<User>.Filter.Eq(x => x.UserId, id);
            var user = _user.Find(filter).FirstOrDefault();
            return user is not null ? Ok(user) : NotFound();
        }

        [HttpPost]
        public async Task<ActionResult> CreateUser(User user)
        {
            if (user == null) return StatusCode(505, "Database connection not ready");

            await _user.InsertOneAsync(user);
            return CreatedAtAction(nameof(GetById), new { id = user.UserId }, user);
        }

        [HttpPut]
        public async Task<ActionResult> UpdateUser(User user)
        {
            if (user == null) return StatusCode(505, "Database connection not ready");

            var filter =  Builders<User>.Filter.Eq(x =>x.UserId, user.UserId);
            await _user.ReplaceOneAsync(filter, user);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            if (_user == null) return StatusCode(505, "Database connection not ready");

            var filter = Builders<User>.Filter.Eq(x =>x.UserId, id);
            await _user.DeleteOneAsync(filter);
            return Ok();
        }
    }
}
