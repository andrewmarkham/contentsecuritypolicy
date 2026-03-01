using System;

namespace Jhoose.Security.Features.Reporting.Models.Dashboard;

public class DashboardGraphItem
{
    public DateTime Time { get; set; }
    public string Metric { get; set; } = string.Empty;
    public int Value { get; set; }
}