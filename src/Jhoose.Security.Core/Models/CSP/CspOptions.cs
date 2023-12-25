using System.Text;

namespace Jhoose.Security.Core.Models.CSP
{
    public class CspOptions
    {
        public CspOptions()
        {
            this.None = false;
            this.Wildcard = false;
            this.Self = false;

            this.UnsafeEval = false;
            this.UnsafeHashes = false;
            this.UnsafeInline = false;
            this.StrictDynamic = false;
            this.Nonce = false;
        }

        public bool None { get; set; }
        public bool Wildcard { get; set; }
        public bool Self { get; set; }
        public bool UnsafeEval { get; set; }
        public bool UnsafeHashes { get; set; }
        public bool UnsafeInline { get; set; }
        public bool StrictDynamic { get; set; }
        public bool Nonce { get; set; }

        public override string ToString()
        {
            var sb = new StringBuilder();

            if (this.None)
            {
                sb.Append("'none'; ");
                return sb.ToString();
            }

            if (this.Wildcard) sb.Append("* ");
            if (this.Self) sb.Append("'self' ");

            if (this.UnsafeEval) sb.Append("'unsafe-eval' ");
            if (this.UnsafeHashes) sb.Append("'unsafe-hashes' ");
            if (this.UnsafeInline) sb.Append("'unsafe-inline' ");
            if (this.StrictDynamic) sb.Append("'strict-dynamic' ");

            if (this.Nonce) sb.Append("'nonce-{0}' ");

            return sb.ToString();
        }

        public bool HasOptions => this.None | this.Wildcard | this.Self | this.UnsafeEval | this.UnsafeHashes | this.UnsafeInline | this.StrictDynamic | this.Nonce;
    }
}