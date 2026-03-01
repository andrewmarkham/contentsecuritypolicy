using Jhoose.Security.Features.Settings.Models;

namespace Jhoose.Security.Features.Settings.Repository;

public interface ISettingsRepository
{
    CspSettings Load();

    bool SaveSettings(CspSettings settings);
}