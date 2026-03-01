namespace Jhoose.Security.Features.Reporting;

public interface IReportingRepositoryFactory
{
    IReportingRepository? GetReportingRepository();
}