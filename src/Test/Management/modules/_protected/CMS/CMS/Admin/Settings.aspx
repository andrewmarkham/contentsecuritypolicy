<%@ Page Language="c#" Codebehind="Settings.aspx.cs" AutoEventWireup="True" Inherits="EPiServer.UI.Admin.SettingsPage"  Title="Settings" %>

<asp:Content ID="Content1" ContentPlaceHolderID="MainRegion" runat="server">

    <script type="text/javascript">
		    function DisableMaxVersions(e)
		    {
		        var versionCount = document.getElementById("<%=EPnVersionCount.ClientID %>");
		        versionCount.value = "";
		        versionCount.disabled = this.checked;
		    }

		    $(document).ready(function() {
		        // We want to attach to the save click button and remove any system messages that has been added from the server.
		        $('#<%= Save.ClientID %>').click(function() {
		            $('.EP-systemMessage').remove();
		        });
		    });
    </script>

    <EPiServerUI:RefreshFrame visible="False" id="frameUpdater" framename="AdminMenu" selectedtabname="AdminTab" runat="server" />

    <EPiServerUI:TabStrip runat="server" id="actionTab" GeneratesPostBack="False" targetid="tabView" supportedpluginarea="SystemSettings">
	    <EPiServerUI:Tab Text="#sitetab" runat="server" ID="Tab1" />
		<EPiServerUI:Tab Text="#edittab" runat="server" ID="Tab2" />
	</EPiServerUI:TabStrip>


    <asp:Panel runat="server" ID="tabView" CssClass="epi-padding">
        <div class="epi-formArea" ID="GeneralTable" runat="server">
            <div class="epi-size25">
                <div>
                    <asp:Label runat="server" AssociatedControlID="EPsErrorHandling" Translate="#epserrorhandling" />
                    <asp:DropDownList ID="EPsErrorHandling" runat="server" />
                </div>
                <div>
                    <asp:Label runat="server" AssociatedControlID="EPsSubscriptionHandler" Translate="#epssubscriptionhandler" />
                    <EPiServerUI:SubscriptionHandlerInput columns="50" id="EPsSubscriptionHandler" runat="server" />
                </div>
                <div class="epi-indent epi-size20">
                    <asp:CheckBox ID="EPfEncryptSensitiveInformation" runat="server"></asp:CheckBox>
                    <asp:Label ID="Label3" AssociatedControlID="EPfEncryptSensitiveInformation"
                        Translate="#epfencryptsensitiveinformationcaption" runat="server" />
                </div>
                <div class="epi-indent epi-size20">
                    <asp:CheckBox ID="EPfEnableGlobalizationSupport" runat="server"></asp:CheckBox>
                    <asp:Label ID="Label2" AssociatedControlID="EPfEnableGlobalizationSupport"
                        Translate="#epfenableglobalizationsupportcaption" runat="server" />
                </div>
                <div class="epi-indent epi-size20">
                    <asp:CheckBox ID="EPfBrowserLanguageDetection" runat="server"></asp:CheckBox>
                    <asp:Label ID="Label1" AssociatedControlID="EPfBrowserLanguageDetection"
                        Translate="#epfbrowserlanguagedetectioncaption" runat="server" />
                </div>
                <div class="epi-indent">
                    <asp:CheckBox ID="EPfDisableVersionDeletion" runat="server"></asp:CheckBox>
                    <asp:Label AssociatedControlID="EPfDisableVersionDeletion"
                        Translate="#epfdisableversiondeletioncaption" runat="server" />
                </div>
            </div>
        </div>
        <div class="epi-formArea" ID="EditingTable" runat="server">
            <div class="epi-size25">
                <div>
                    <asp:Label ID="Label5" runat="server" AssociatedControlID="EPsEditCSS" Translate="#epseditcsscaption" />
                    <asp:TextBox Columns="50" ID="EPsEditCSS" runat="server"></asp:TextBox>
                    <asp:CustomValidator ID="EditCssValidator" runat="server" OnServerValidate="ValidateEditCss" Text="*"/>
                </div>
                <div>
                    <asp:Label runat="server" AssociatedControlID="EPnVersionCount" Translate="#epnversioncountcaption" />
                    <asp:TextBox Columns="10" ID="EPnVersionCount" runat="server" CssClass="EP-requiredField"></asp:TextBox>
                     <EPiServerScript:ScriptEvent EventTargetID="EPfUnlimitedVersions" EventType="click" EventHandler="DisableMaxVersions" runat="server" />
                    <asp:RequiredFieldValidator ControlToValidate="EPnVersionCount" runat="server" ID="VersionCountRequiredValidator" EnableClientScript="false">*</asp:RequiredFieldValidator>
                    <asp:RangeValidator ControlToValidate="EPnVersionCount" Type="Integer" MinimumValue="1" MaximumValue="100" runat="server" ID="VersionCountRangeValidator" EnableClientScript="true">*</asp:RangeValidator>
                </div>
                <div class="epi-indent epi-size20">
                    <asp:CheckBox ID="EPfUnlimitedVersions" runat="server"></asp:CheckBox>
                    <asp:Label ID="Label6" runat="server" AssociatedControlID="EPfUnlimitedVersions" Translate="#unlimitedversions" />
                </div>
                <div class="epi-indent epi-size20">
                    <asp:CheckBox ID="EPfAutoPublishMediaOnUpload" runat="server"></asp:CheckBox>
                    <asp:Label ID="Label4" runat="server" AssociatedControlID="EPfAutoPublishMediaOnUpload" Translate="#autopublishmediaonupload"/>
                </div>
            </div>
        </div>
    </asp:Panel>
    <div class="epi-buttonContainer">
        <EPiServerUI:ToolButton id="Save" DisablePageLeaveCheck="true" OnClick="Save_Click" runat="server" SkinID="Save" text="<%$ Resources: EPiServer, button.save %>" ToolTip="<%$ Resources: EPiServer, button.save %>" /><EPiServerUI:ToolButton id="Cancel" runat="server" CausesValidation="false" SkinID="Cancel" text="<%$ Resources: EPiServer, button.cancel %>" ToolTip="<%$ Resources: EPiServer, button.cancel %>" />
        <EPiServerScript:ScriptReloadPageEvent ID="ScriptReloadPageEvent1" EventTargetID="Cancel" EventType="click" runat="server" />
    </div>
</asp:Content>
