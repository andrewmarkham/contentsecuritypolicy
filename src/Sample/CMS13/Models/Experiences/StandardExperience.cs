using EPiServer.VisualBuilder;

namespace alloy13preview.Models.Experiences;

/// <summary>
/// Used primarily for publishing news articles on the website
/// </summary>
[SiteContentType(
    GroupName = Globals.GroupNames.Experiences,
    GUID = "d9b1c8e5-9c3a-4f0b-8c7e-2a1b2c3d4e5f")]
[SiteImageUrl(Globals.StaticGraphicsFolderPath + "page-type-thumbnail-article.png")]
public class StandardExperience : ExperienceData
{
    public override void SetDefaultValues(ContentType contentType)
    {
        base.SetDefaultValues(contentType);

        //VisibleInMenu = false;
    }
}