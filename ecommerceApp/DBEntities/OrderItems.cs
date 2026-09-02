using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ecommerceApp.DBEntities
{
    public class OrderItems
    {
        [BsonId]
        [BsonElement("_id"), BsonRepresentation(BsonType.ObjectId)]
        public string? OrderItemId { get; set; }

        [BsonElement("orderId"), BsonRepresentation(BsonType.ObjectId)]
        public string? OrderId { get; set; }

        [BsonElement("productId"), BsonRepresentation(BsonType.ObjectId)]
        public string? ProductId { get; set; }

        [BsonElement("orderItemQuantity"), BsonRepresentation(BsonType.Int32)]
        public int? OrderItemQuantity { get; set; }

        [BsonElement("orderItemUnitPrice"), BsonRepresentation(BsonType.Double)]
        public double? OrderItemUnitPrice { get; set; }
    }
}
