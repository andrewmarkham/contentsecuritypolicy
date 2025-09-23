
using Microsoft.AspNetCore.Mvc;

using Jhoose.Security.Core.Repository;
using System;
using System.Linq;
using Jhoose.Security.Webhooks;

namespace Jhoose.Security.Controllers.Api;

public abstract class NotificationBaseController(ICspPolicyRepository policyRepository,
                     IWebhookNotifications webhookNotifications) : ControllerBase
{
    protected virtual void NotifyWebhooks()
    {
        var settings = policyRepository.Settings();
        var webhoookUrls = settings.WebhookUrls?.Select(u => new Uri(u)).ToList() ?? [];

        webhookNotifications.Notify(webhoookUrls);
    }
}