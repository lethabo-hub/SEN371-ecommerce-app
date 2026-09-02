using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ecommerceApp.DBEntities
{
    public class Review
    {

        [BsonId]
        [BsonElement("_id"), BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("productId"), BsonRepresentation(BsonType.ObjectId)]
        public string? ProductId { get; set; }

        [BsonElement("userId"), BsonRepresentation(BsonType.ObjectId)]
        public string? UserId { get; set; }

        [BsonElement("reviewRating"), BsonRepresentation(BsonType.Int32)]
        public int? ReviewRating { get; set; }

        [BsonElement("reviewComment"), BsonRepresentation(BsonType.String)]
        public string? ReviewComment { get; set; }

        [BsonElement("reviewDate"), BsonRepresentation(BsonType.DateTime)]
        public DateTime? ReviewDate { get; set; }
    }

}
