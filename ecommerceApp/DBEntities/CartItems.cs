using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using ecommerceApp.DBEntities;

namespace ecommerceApp.DBEntities
{
    public class CartItems
    {
        [BsonId]
        [BsonElement("_id"), BsonRepresentation(BsonType.ObjectId)]
        public string? CartItemId { get; set; }

        [BsonElement("cartId"), BsonRepresentation(BsonType.ObjectId)]
        public string? CartId { get; set; }

        [BsonElement("productId"), BsonRepresentation(BsonType.ObjectId)]
        public string? ProductId { get; set; }

        [BsonElement("quantity"), BsonRepresentation(BsonType.Int32)]
        public int? Quantity { get; set; }
    }
}
