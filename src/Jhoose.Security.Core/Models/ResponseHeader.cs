using System;

namespace Jhoose.Security.Core.Models
{

    public class ResponseHeader : IResponseHeader
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public bool Enabled { get; set; } = true;

        public virtual string Name { get; set; } = string.Empty;
        public virtual string Value { get; set; } = string.Empty;
    }
}