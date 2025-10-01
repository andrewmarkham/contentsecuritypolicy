using System.Collections.Generic;

using Jhoose.Security.Core.Models;
using Jhoose.Security.Core.Repository;

namespace Jhoose.Security.Core.Provider
{
    public class StandardResponseHeadersProvider : IResponseHeadersProvider
    {
        private readonly IResponseHeadersRepository responseHeadersRepository;

        public StandardResponseHeadersProvider(IResponseHeadersRepository responseHeadersRepository
            )
        {
            this.responseHeadersRepository = responseHeadersRepository;
        }

        public void Initialize()
        {
            this.responseHeadersRepository.Bootstrap();
        }

        public IEnumerable<ResponseHeader> ResponseHeaders()
        {
            return this.responseHeadersRepository.List();
        }
    }
}