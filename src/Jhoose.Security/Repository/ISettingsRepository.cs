using Jhoose.Security.Models.CSP;

namespace Jhoose.Security.Repository;

public interface ISettingsRepository
{
    CspSettings Settings();

    bool SaveSettings(CspSettings settings);

    void Bootstrap();
}