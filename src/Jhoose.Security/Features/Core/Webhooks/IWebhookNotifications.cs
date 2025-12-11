using System;
using System.Collections.Generic;

namespace Jhoose.Security.Features.Core.Webhooks;

/// <summary>
/// Defines a contract for sending webhook notifications to registered endpoints.
/// </summary>
public interface IWebhookNotifications
{
    
    /// <summary>
    /// Sends notifications to the specified list of webhook endpoints.
    /// </summary>
    /// <param name="endPoints">A list of URIs representing the webhook endpoints to notify.</param>
    void Notify(List<Uri> endPoints);
}