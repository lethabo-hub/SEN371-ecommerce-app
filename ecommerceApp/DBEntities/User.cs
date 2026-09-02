using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ecommerceApp.DBEntities
{
    public class User
    {
        [BsonId]
        [BsonElement("_id"), BsonRepresentation(BsonType.ObjectId)]
        public string? UserId { get; set; }

        [BsonElement("user_name"), BsonRepresentation(BsonType.String)]
        public string? UserName { get; set; }

        [BsonElement("user_email"), BsonRepresentation(BsonType.String)]
        public string? UserEmail { get; set; }

        [BsonElement("user_passwordhash"), BsonRepresentation(BsonType.String)]
        public string? UserPasswordHash { get; set; }
    }
}
