using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ecommerceApp.DBEntities
{
    public class Order
    {
      
            [BsonId]
            [BsonElement("_id"), BsonRepresentation(BsonType.ObjectId)]
            public string? OrderId { get; set; }

            [BsonElement("userId"), BsonRepresentation(BsonType.ObjectId)]
            public string? UserId { get; set; }

            [BsonElement("cartId"), BsonRepresentation(BsonType.ObjectId)]
            public string? CartId { get; set; }

            [BsonElement("orderDate"), BsonRepresentation(BsonType.DateTime)]
            public DateTime? OrderDate { get; set; }

            [BsonElement("orderTotalAmount"), BsonRepresentation(BsonType.Double)]
            public double? OrderTotalAmount { get; set; }

            [BsonElement("orderStatus"), BsonRepresentation(BsonType.String)]
            public string? OrderStatus { get; set; }

            [BsonElement("orderItems")]
            public List<OrderItem>? OrderItems { get; set; }

            [BsonElement("payment")]
            public PaymentDetails? Payment { get; set; }
    }

    public class OrderItem
    {
        [BsonElement("productId"), BsonRepresentation(BsonType.ObjectId)]
        public string? ProductId { get; set; }

        [BsonElement("orderItemQuantity"), BsonRepresentation(BsonType.Int32)]
        public int? OrderItemQuantity { get; set; }

        [BsonElement("orderItemUnitPrice"), BsonRepresentation(BsonType.Double)]
        public double? OrderItemUnitPrice { get; set; }
    }

    public class PaymentDetails
    {
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
