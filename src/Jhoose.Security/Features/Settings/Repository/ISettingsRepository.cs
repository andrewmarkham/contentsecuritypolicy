using Jhoose.Security.Features.Settings.Models;

namespace Jhoose.Security.Features.Settings.Repository;

public interface ISettingsRepository
{
    CspSettings Settings();

    bool SaveSettings(CspSettings settings);

    void Bootstrap();
}