using System;
using System.Collections.Generic;

namespace Jhoose.Security.Webhooks;

public interface IWebhookNotifications
{
    void Notify(List<Uri> endPoints);
}