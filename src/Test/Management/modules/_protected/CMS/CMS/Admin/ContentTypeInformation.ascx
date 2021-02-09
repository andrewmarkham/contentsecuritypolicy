<%@ Control Language="C#" AutoEventWireup="True" CodeBehind="ContentTypeInformation.ascx.cs" Inherits="EPiServer.UI.Admin.ContentTypeInformation" %>

<script type="text/javascript">
    //<![CDATA[
    $(document).ready(function () {
        $("#<%= WebFormTemplatePathRadio.ClientID %>").click(function () { EnableInputControl("<%= WebFormTemplatePath.ClientID %>") });
        $("#<%= WebFormTemplateListRadio.ClientID %>").click(function () { EnableInputControl("<%= WebFormTemplateList.ClientID %>") });
        $("#<%= MvcTemplateListRadio.ClientID %>").click(function () { EnableInputControl("<%= MvcTemplateList.ClientID %>") });
    });

    function EnableInputControl(controlID) {
        document.getElementById("<%= WebFormTemplatePath.ClientID %>").disabled = "<%= WebFormTemplatePath.ClientID%>" != controlID;
        document.getElementById("<%= WebFormTemplateList.ClientID %>").disabled = "<%= WebFormTemplateList.ClientID%>" != controlID;
        document.getElementById("<%= MvcTemplateList.ClientID %>").disabled = "<%= MvcTemplateList.ClientID%>" != controlID;
    }
    //]]> 
</script>

<fieldset>
    <legend>
        <span><asp:Literal runat="server" Text="<%$ Resources: EPiServer, admin.contenttypeinformation.generalheading %>" /></span>
    </legend>
    <dl>
        <asp:PlaceHolder runat="server" Visible="<%# ShouldShowVersionInfo %>">
            <dt><%: Translate("/admin/contenttypeinformation/versioncaption") %></dt>
            <dd><%: ContentTypeData.Version %></dd>
        </asp:PlaceHolder>
        <asp:PlaceHolder runat="server" Visible="<%# ShouldShowCodeInfo %>">
            <dt><%: Translate("/admin/editcontenttype/fromcode") %></dt>
            <dd><%: Translate("/button/yes") %></dd>
        </asp:PlaceHolder>
        <dt>
            <asp:Label ID="ContentTypeNameLabel" runat="server" AssociatedControlID="ContentTypeName" Text="<%$ Resources: EPiServer, admin.editpagetypesettings.namecaption %>" />
        </dt>
        <dd>
            <asp:TextBox ID="ContentTypeName" runat="server" CssClass="EP-requiredField" MaxLength="50" Columns="50"></asp:TextBox>
            <asp:Label ID="ContentTypeNameLocked" runat="server" Visible="false"><%: ContentTypeData.Name %></asp:Label>
            <asp:RequiredFieldValidator ID="ContentTypeNameValidator" ControlToValidate="ContentTypeName" Text="*" EnableClientScript="false" runat="server" />
            <asp:CustomValidator ID="ContentTypeUniqueNameValidator" runat="server" Text="*" OnServerValidate="ValidateUniqueName" />
        </dd>
        <dt><asp:Literal runat="server" Text="<%$ Resources: EPiServer, admin.editpagetypesettings.basecaption %>"/></dt>
        <dd><%: ContentTypeData != null ? ContentTypeData.Base.ToString() : ""%></dd>
        <dt>
            <asp:Label ID="ContentTypeDisplayNameLabel" runat="server" AssociatedControlID="ContentTypeDisplayName" Text="<%$ Resources: EPiServer, admin.contenttypeinformation.displaynamecaption %>" />
        </dt>
        <dd>
            <asp:TextBox ID="ContentTypeDisplayName" runat="server" MaxLength="50" Columns="50"></asp:TextBox>
            <asp:Label ID="ContentTypeDisplayNameLocked" runat="server" Visible="false"><%: ContentTypeData.DisplayName %></asp:Label>
        </dd>
        <dt>
            <asp:Label ID="ContentTypeDescriptionLabel" runat="server" AssociatedControlID="ContentTypeDescription" Text="<%$ Resources: EPiServer, admin.editpagetypesettings.descriptioncaption %>" />
        </dt>
        <dd>
            <asp:TextBox ID="ContentTypeDescription" runat="server" MaxLength="255" Columns="50"></asp:TextBox>
            <asp:Label ID="ContentTypeDescriptionLocked" runat="server" Visible="false"><%: ContentTypeData.Description %></asp:Label>
        </dd>
        <dt>
            <asp:Label ID="ContentTypeSortOrderLabel" runat="server" AssociatedControlID="ContentTypeSortOrder" Text="<%$ Resources: EPiServer, admin.editpagetypesettings.sortordercaption %>" />
        </dt>
        <dd>
            <asp:TextBox ID="ContentTypeSortOrder" runat="server" CssClass="EP-requiredField" MaxLength="11" SkinID="Size50"></asp:TextBox>
            <asp:Label ID="ContentTypeSortOrderLocked" runat="server" Visible="false"><%: ContentTypeData.SortOrder %></asp:Label>
            <asp:RequiredFieldValidator ID="ContentTypeSortOrderRequired" ControlToValidate="ContentTypeSortOrder" Text="*" EnableClientScript="false" runat="server" />
            <asp:RangeValidator ID="ContentTypeSortOrderNumeric" MinimumValue="-2147483648" MaximumValue="2147483647" Type="Integer" Text="*" ControlToValidate="ContentTypeSortOrder" runat="server" />
        </dd>
        <dt></dt>
        <dd>
            <asp:CheckBox ID="ContentTypeAvailable" runat="server"></asp:CheckBox>
            <asp:Label runat="server" AssociatedControlID="ContentTypeAvailable" Text="<%$ Resources: EPiServer, admin.editpagetypesettings.availablecaption %>" />
        </dd>
    </dl>
</fieldset>
<fieldset>
    <legend>
        <span><asp:Literal runat="server" Text="<%$ Resources: EPiServer, admin.editpagetypesettings.displaytemplate %>" /></span>
    </legend>
    <dl>
        <asp:PlaceHolder ID="WebFormTemplatePathRow" Visible="<%# IsEditingPageType %>" runat="server">
            <dt>
                <asp:Label ID="WebFormTemplatePathLabel" runat="server" AssociatedControlID="WebFormTemplatePath" Text="<%$ Resources: EPiServer, admin.editpagetypesettings.webformtemplatepath %>" />
            </dt>
            <dd>
                <asp:RadioButton ID="WebFormTemplatePathRadio" GroupName="DisplayTemplate" runat="server" />
                <asp:TextBox ID="WebFormTemplatePath" runat="server" MaxLength="255" Columns="50" />
                <asp:Label ID="WebFormTemplatePathLocked" runat="server" Visible="false"><%: WebFormTemplatePath.Text%></asp:Label>
                <asp:CustomValidator ID="WebFormTemplatePathValidator"
                    ControlToValidate="WebFormTemplatePath"
                    Text="*"
                    EnableClientScript="false"
                    ErrorMessage="<%$ Resources: EPiServer, admin.contenttypeinformation.notvalidpath %>"
                    ValidateEmptyText="false"
                    OnServerValidate="WebFormTemplatePath_ServerValidate"
                    runat="server" />
            </dd>
        </asp:PlaceHolder>
        <asp:PlaceHolder ID="WebFormTemplateListRow" runat="server">
            <dt>
                <asp:Label ID="WebFormTemplateListLabel" runat="server" AssociatedControlID="WebFormTemplateList" Text="<%$ Resources: EPiServer, admin.editpagetypesettings.webformtemplate %>" />
            </dt>
            <dd>
                <asp:RadioButton ID="WebFormTemplateListRadio" GroupName="DisplayTemplate" Visible="<%# IsEditingPageType %>" runat="server" />
                <asp:DropDownList ID="WebFormTemplateList" runat="server" />
                <asp:Label ID="WebFormTemplateListLocked" runat="server" Visible="false"><%: WebFormTemplateList.SelectedItem != null ? WebFormTemplateList.SelectedItem.Text : String.Empty%></asp:Label>
            </dd>
        </asp:PlaceHolder>
        <asp:PlaceHolder ID="MvcTemplateListRow" runat="server">
            <dt>
                <asp:Label ID="MvcTemplateListLabel" runat="server" AssociatedControlID="MvcTemplateList" Text="<%$ Resources: EPiServer, admin.editpagetypesettings.mvctemplate %>" />
            </dt>
            <dd>
                <asp:RadioButton ID="MvcTemplateListRadio" GroupName="DisplayTemplate" Visible="<%# IsEditingPageType %>" runat="server" />
                <asp:DropDownList ID="MvcTemplateList" runat="server" />
                <asp:Label ID="MvcTemplateListLocked" runat="server" Visible="false"><%: MvcTemplateList.SelectedItem != null ? MvcTemplateList.SelectedItem.Text : String.Empty%></asp:Label>
            </dd>
        </asp:PlaceHolder>
    </dl>
</fieldset>

<asp:PlaceHolder runat="server" ID="AdvancedSection">
    <fieldset>
        <legend><span><%: Translate("/admin/contenttypeinformation/advancedheading") %></span></legend>
        <dl>
            <dt>Guid</dt>
            <dd><%: ContentTypeData.GUID %></dd>
            <dt><%: Translate("/admin/contenttypeinformation/typename") %></dt>
            <dd><%: ContentTypeData.ModelTypeString %></dd>
            <dt><%: Translate("/admin/contenttypeinformation/createdcaption") %></dt>
            <dd><%: ContentTypeData.Created %></dd>
            <dt><%: Translate("/admin/contenttypeinformation/savedcaption") %></dt>
            <dd><%: ContentTypeData.Saved %></dd>
            <dt><%: Translate("/admin/contenttypeinformation/savedbycaption") %></dt>
            <dd><%: ContentTypeData.SavedBy %></dd>
            <dt>&nbsp;</dt>
            <dd>
                <episerverui:toolbutton id="SyncModel"
                    causesvalidation="false"
                    onclick="SyncModel_Click"
                    generatespostback="True"
                    runat="server"
                    text="<%$ Resources: EPiServer, admin.contenttypeinformation.synchronize %>"
                    tooltip="<%$ Resources: EPiServer, admin.contenttypeinformation.synchronizetooltip %>"
                    skinid="Refresh" />
            </dd>
        </dl>
    </fieldset>
</asp:PlaceHolder>
