using Jhoose.Security.Core.Models.CSP;

namespace Jhoose.Security.Core.Repository;

public interface ISettingsRepository
{
    CspSettings Settings();

    bool SaveSettings(CspSettings settings);

    void Bootstrap();
}