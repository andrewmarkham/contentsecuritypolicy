using System;
using System.Text.Json;

using System.Security.Cryptography;
using System.Text;

namespace Jhoose.Security.Core.Helpers;

public static class ObjectHasher
{
    private static readonly JsonSerializerOptions jsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    /// <summary>
    /// Computes a SHA256 hash for the given object.
    /// </summary>
    /// <param name="obj">The object to hash.</param>
    /// <returns>Hexadecimal string representation of the hash.</returns>
    public static string ComputeHash(object obj)
    {
        if (obj == null)
            throw new ArgumentNullException(nameof(obj));

        var json = JsonSerializer.Serialize(obj, jsonOptions).AsSpan();
        using var sha256 = SHA256.Create();
        byte[] bytes = Encoding.UTF8.GetBytes(json.ToArray());
        byte[] hash = sha256.ComputeHash(bytes);
        var sb = new StringBuilder(hash.Length * 2);
        foreach (var b in hash)
            sb.AppendFormat("{0:x2}", b);
        return sb.ToString();
    }
}