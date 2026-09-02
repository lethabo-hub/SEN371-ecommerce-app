using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ecommerceApp.DBEntities
{
    public class Product
    {
        [BsonId]
        [BsonElement("_id"), BsonRepresentation(BsonType.ObjectId)]
        public string? ProductId { get; set; }

        [BsonElement("productTitle"), BsonRepresentation(BsonType.String)]
        public string? ProductTitle { get; set; }

        [BsonElement("productPrice"), BsonRepresentation(BsonType.Double)]
        public double? ProductPrice { get; set; }

        [BsonElement("productDescription"), BsonRepresentation(BsonType.String)]
        public string? ProductDescription { get; set; }

        [BsonElement("productImage"), BsonRepresentation(BsonType.String)]
        public string? ProductImage { get; set; }

        [BsonElement("productStock"), BsonRepresentation(BsonType.Int32)]
        public int? ProductStock { get; set; }
    }
}
