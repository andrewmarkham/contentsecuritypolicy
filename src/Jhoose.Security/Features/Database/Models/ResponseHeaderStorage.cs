using System;

namespace Jhoose.Security.Features.Data.Models;

/// <summary>
/// Represents a storage model for HTTP response header configurations.
/// </summary>
/// <param name="Id">The unique identifier for the response header storage entry.</param>
/// <param name="Name">The name of the HTTP response header.</param>
/// <param name="Directive">The directive or policy type associated with the header.</param>
/// <param name="Value">The serializable value to be set for the response header directive.</param>
public record ResponseHeaderStorage(Guid Id, string Name, string Directive, string Value);


