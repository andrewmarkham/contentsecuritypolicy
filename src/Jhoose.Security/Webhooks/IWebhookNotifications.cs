using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Jhoose.Security.Webhooks
{
    public interface IWebhookNotifications
    {
        void Notify(List<Uri> endPoints);
    }
}

