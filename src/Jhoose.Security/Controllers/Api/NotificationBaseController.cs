
using System;
using System.Linq;

using Jhoose.Security.Core.Repository;
using Jhoose.Security.Webhooks;

using Microsoft.AspNetCore.Mvc;

namespace Jhoose.Security.Controllers.Api;
/// <summary>
/// Base controller that provides webhook notification helpers.
/// </summary>
/// <param name="settingsRepository">Repository for settings.</param>
/// <param name="webhookNotifications">Service to send webhook notifications.</param>
public abstract class NotificationBaseController(
                     ISettingsRepository settingsRepository,
                     IWebhookNotifications webhookNotifications) : ControllerBase
{
    /// <summary>
    /// Notifies configured webhook URLs using the webhook notifications service.
    /// </summary>
    protected virtual void NotifyWebhooks()
    {
        var settings = settingsRepository.Settings();
        var webhoookUrls = settings.WebhookUrls?.Select(u => new Uri(u)).ToList() ?? [];

        webhookNotifications.Notify(webhoookUrls);
    }
}   