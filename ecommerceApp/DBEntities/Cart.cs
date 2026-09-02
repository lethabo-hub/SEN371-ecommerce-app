using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;


namespace ecommerceApp.DBEntities
{
    public class Cart
    {
        [BsonId]
        [BsonElement("_id"), BsonRepresentation(BsonType.ObjectId)]
        public string? CartId { get; set; }

        [BsonElement("userId"), BsonRepresentation(BsonType.ObjectId)]
        public string? UserId { get; set; }

        [BsonElement("cartCreatedDate"), BsonRepresentation(BsonType.DateTime)]
        public DateTime? CartCreatedDate { get; set; }

        [BsonElement("cartItems")]
        public List<CartItem>? CartItems { get; set; }
    }
    public class CartItem
    {
        [BsonElement("productId"), BsonRepresentation(BsonType.ObjectId)]
        public string? ProductId { get; set; }

        [BsonElement("quantity"), BsonRepresentation(BsonType.Int32)]
        public int? Quantity { get; set; }
    }
}
