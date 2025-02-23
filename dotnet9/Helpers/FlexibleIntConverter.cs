using System;
using System.Text.Json;
using System.Text.Json.Serialization;

public class FlexibleIntConverter : JsonConverter<int?>
{
    public override int? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        // If the token is a number, try to read it as int.
        if (reader.TokenType == JsonTokenType.Number && reader.TryGetInt32(out int intValue))
            return intValue;
        
        // If it's a string, try to parse it.
        if (reader.TokenType == JsonTokenType.String)
        {
            var str = reader.GetString();
            if (int.TryParse(str, out int result))
                return result;
        }
        return null;
    }

    public override void Write(Utf8JsonWriter writer, int? value, JsonSerializerOptions options)
    {
        if (value.HasValue)
            writer.WriteNumberValue(value.Value);
        else
            writer.WriteNullValue();
    }
}
