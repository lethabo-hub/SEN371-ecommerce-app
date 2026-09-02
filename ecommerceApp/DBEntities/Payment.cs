using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ecommerceApp.DBEntities
{
    public class Payment
    {
        [BsonId]
        [BsonElement("_id"), BsonRepresentation(BsonType.ObjectId)]
        public string? PaymentId { get; set; }

        [BsonElement("orderId"), BsonRepresentation(BsonType.ObjectId)]
        public string? OrderId { get; set; }

        [BsonElement("paymentMethod"), BsonRepresentation(BsonType.String)]
        public string? PaymentMethod { get; set; }

        [BsonElement("paymentStatus"), BsonRepresentation(BsonType.String)]
        public string? PaymentStatus { get; set; }

        [BsonElement("paymentDate"), BsonRepresentation(BsonType.DateTime)]
        public DateTime? PaymentDate { get; set; }

        [BsonElement("paymentTotal"), BsonRepresentation(BsonType.Double)]
        public double? PaymentTotal { get; set; }
    }
}
