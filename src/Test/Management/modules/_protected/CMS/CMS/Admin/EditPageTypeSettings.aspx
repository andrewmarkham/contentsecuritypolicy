<%@ Page Language="c#" CodeBehind="EditPageTypeSettings.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.EditPageTypeSettings" Title="EditPageTypeSettings" %>

<%@ Register TagPrefix="EPiServerUI" TagName="ContentTypeInformation" Src="ContentTypeInformation.ascx" %>
<%@ Register TagPrefix="EPiServerUI" TagName="BreakingChangePrompt" Src="BreakingChangePrompt.ascx" %>

<asp:Content ContentPlaceHolderID="HeaderContentRegion" runat="server">
    <script type="text/javascript">
    //<![CDATA[
        function OnLoadUseDefaultValues(){
            if(!document.getElementById("<%= PageTypeIsDefault.ClientID %>").checked)
            {
                OnUseDefaultValuesChange(true);
            }
        }

        function OnUseDefaultValuesChange(disableStatus){
            var disabled = "";
            if (disableStatus)
            {
                disabled = "disabled";
            }
            
            var style = 'EPEdit-inputString';
            if(disableStatus){
                style = 'EPEdit-inputStringDisabled';
            }
           
            var startPublishOffset = document.getElementById("<%= StartPublishOffset.ClientID %>")
            startPublishOffset.getElementsByTagName("input")[0].disabled = disabled;
            startPublishOffset.getElementsByTagName("select")[0].disabled = disabled;
            
            var stopPublishOffset = document.getElementById("<%= StopPublishOffset.ClientID %>")
            stopPublishOffset.getElementsByTagName("input")[0].disabled = disabled;
            stopPublishOffset.getElementsByTagName("select")[0].disabled = disabled;
            
            document.getElementById("<%= VisibleInMenu.ClientID %>").disabled = disabled;
            document.getElementById("<%= PeerOrder.ClientID %>").disabled = disabled;
           
            var childOrderRule = document.getElementById("<%= ChildOrderRule.ClientID %>");
            childOrderRule.getElementsByTagName("select")[0].disabled = disabled;
           
            
            var archivePageLink = document.getElementById("<%= ArchivePageLink.ClientID %>");
            EPi.GetElementsByAttribute("input", "type", "button", archivePageLink)[0].disabled = disabled;
            
            var defaultFrame = document.getElementById("<%= DefaultFrame.ClientID %>");
            defaultFrame.getElementsByTagName("select")[0].disabled = disabled;
        }

        function OnSelectAllPageTypesChange() {
            var availablePageTypePanelId = "#<%= AllowedPageTypesPanel.ClientID %>";
            var selectAllBox = $("input:radio", availablePageTypePanelId);
            var selectedItem = null;
            for (var i = 0; i < selectAllBox.length; i++) {
                if (selectAllBox[i].checked) {
                    selectedItem = selectAllBox[i];
                    break;
                }
            }

            var checked;
            var disabled = "disabled";
            if (selectedItem.value == 'all' || selectedItem.value == 'default') {
                checked = true;
            }
            else if (selectedItem.value == 'none') {
                checked = false;
            }
            else if (selectedItem.value == 'specific') {
                disabled = "";
            }

            var table = EPi.GetElementsByAttribute("table", "id", "<%= AllowedPageTypesTableId %>", null, true)[0];
            for(var i=1; i<table.rows.length; i++){
                var child = table.rows[i].cells[0].childNodes[0];
                if(child.type == 'checkbox'){
                    child.disabled = disabled;
                    if (checked != undefined) {
                        child.checked = checked;
                    }
                }
            }
        }

        function OnLoadSetSelectAllPageTypes(){
            OnSelectAllPageTypesChange(); 
        } 

        function InitialzeAllPageTypesChecked(){
            OnSelectAllPageTypesChange();
        }
    //]]> 
    </script>
</asp:Content>

<asp:Content ContentPlaceHolderID="MainRegion" runat="server">
    <EPiServerUI:TabStrip runat="server" ID="actionTab" GeneratesPostBack="False" TargetID="TabView">
        <EPiServerUI:Tab Text="#tabinfo" runat="server" ID="Tab1" sticky="True" />
        <EPiServerUI:Tab Text="#tabdefaultvalues" runat="server" ID="Tab2" sticky="True" />
        <EPiServerUI:Tab Text="#tabtypetotype" runat="server" ID="Tab3" sticky="True" />
    </EPiServerUI:TabStrip>

    <div class="epi-formArea epi-padding">
        <asp:Panel ID="TabView" runat="server">
            <asp:Panel ID="GeneralSettings" runat="server">
                <div class="epi-formArea">
                    <EPiServerUI:ContentTypeInformation runat="server" ID="ContentTypeInformation" />
                    <fieldset>
                        <legend><%=Translate("#requiredaccess")%></legend>
                        <div>
                            <EPiServerUI:MembershipAccessLevel ID="PageTypeAccess" runat="server"
                                CssClass="EPEdit-sidAccessLevel"
                                EnableSelectAll="false" />
                            <EPiServerUI:ToolButton ID="UserGroupAddButton" runat="server"
                                GeneratesPostBack="False"
                                OnClientClick="OpenUserGroupBrowser(0);"
                                Text="<%$ Resources: EPiServer, button.addusergroupsid %>"
                                ToolTip="<%$ Resources: EPiServer, button.addusergroupsid %>"
                                SkinID="AddUserGroup" />
                        </div>
                    </fieldset>
                </div>
            </asp:Panel>
            <asp:Panel ID="DefaultSettings" runat="server">
                <div class="epi-formArea">
                    <div class="epi-size10">
                        <div class="epi-indent epi-size30">
                            <asp:CheckBox ID="PageTypeIsDefault" runat="server" onclick="OnUseDefaultValuesChange(!this.checked);"></asp:CheckBox>
                            <asp:Label runat="server" AssociatedControlID="PageTypeIsDefault" Translate="#usecustomdefaultcaption" />
                        </div>
                        <div>
                            <asp:Label runat="server" AssociatedControlID="StartPublishOffset" Text="Start Publish Date" />
                            <EPiServer:InputTimeSpan ID="StartPublishOffset" runat="server" DisplayName="<%$ Resources: EPiServer, admin.editpagetypesettings.defaultstartpublishcaption %>" style="display: inline; margin-bottom: 0;" />
                            <em class="epi-indent epi-inputHelper"><%=Translate("#defaultstartpublishcaption") %></em>
                        </div>
                        <div>
                            <asp:Label runat="server" AssociatedControlID="StopPublishOffset" Translate="Stop Publish Date" />
                            <EPiServer:InputTimeSpan ID="StopPublishOffset" runat="server" DisplayName="<%$ Resources: EPiServer, admin.editpagetypesettings.defaultstoppublishcaption %>" style="display: inline; margin-bottom: 0;" />
                            <em class="epi-indent epi-inputHelper"><%=Translate("#defaultstoppublishcaption")%></em>
                        </div>
                        <div class="epi-indent epi-size20">
                            <asp:CheckBox ID="VisibleInMenu" runat="server" Checked="True"></asp:CheckBox>
                            <asp:Label runat="server" AssociatedControlID="VisibleInMenu" Translate="/contenttypes/icontentdata/properties/pagevisibleinmenu/caption" />
                        </div>
                        <div>
                            <asp:Label runat="server" AssociatedControlID="PeerOrder" Translate="/contenttypes/icontentdata/properties/pagepeerorder/caption" />
                            <asp:TextBox ID="PeerOrder" runat="server" MaxLength="10" Columns="5"></asp:TextBox>
                            <asp:CustomValidator ID="PeerOrderValidator" runat="server" Text="*" OnServerValidate="ValidatePeerOrder" />
                        </div>
                        <div>
                            <asp:Label runat="server" AssociatedControlID="ChildOrderRule" Translate="/contenttypes/icontentdata/properties/pagechildorderrule/caption" />
                            <EPiServer:InputSortOrder ID="ChildOrderRule" runat="server" style="display: inline;"></EPiServer:InputSortOrder>
                        </div>
                        <div>
                            <asp:Label runat="server" AssociatedControlID="ArchivePageLink" Translate="/contenttypes/icontentdata/properties/pagearchivelink/caption" />
                            <EPiServer:InputPageReference ID="ArchivePageLink" DisableCurrentPageOption="true" runat="server" style="display: inline;"></EPiServer:InputPageReference>
                            <asp:CustomValidator ID="ArchiveLinkValidator" runat="server" Text="*" OnServerValidate="ValidateArchiveLink" />
                        </div>
                        <div>
                            <asp:Label runat="server" AssociatedControlID="DefaultFrame" Translate="/contenttypes/icontentdata/properties/pageframeid/caption" />
                            <EPiServer:InputFrame ID="DefaultFrame" runat="server" style="display: inline;"></EPiServer:InputFrame>
                        </div>
                    </div>
                </div>
            </asp:Panel>
            <asp:Panel ID="AllowedPageTypesPanel" runat="server" />
        </asp:Panel>

        <div class="epi-buttonContainer">
            <EPiServerUI:BreakingChangePrompt runat="server" ID="BreakingChangePrompt" />
            <EPiServerUI:ToolButton ID="DeleteButton" runat="server"
                DisablePageLeaveCheck="true"
                Text="<%$ Resources: EPiServer, button.delete %>"
                ToolTip="<%$ Resources: EPiServer, button.delete %>"
                SkinID="Delete"
                OnClick="DeleteButton_Click"
                CausesValidation="False" />
            <EPiServerUI:ToolButton ID="ApplyButton" runat="server"
                DisablePageLeaveCheck="true"
                Text="<%$ Resources: EPiServer, button.save %>"
                ToolTip="<%$ Resources: EPiServer, button.save %>"
                SkinID="Save"
                OnClick="ApplyButton_Click" />
            <EPiServerUI:ToolButton ID="DeleteCustomSettings" runat="server"
                DisablePageLeaveCheck="true"
                Text="<%$ Resources: EPiServer, admin.contenttypeinformation.deletecustomsettings %>"
                ToolTip="<%$ Resources: EPiServer, admin.contenttypeinformation.deletecustomsettingstooltip %>"
                SkinID="Delete"
                ConfirmMessage="<%$ Resources: EPiServer, admin.contenttypeinformation.deletecustomsettingsconfirm %>"
                OnClick="DeleteCustomSettingsButton_Click"
                CausesValidation="False" />
            <EPiServerUI:ToolButton ID="CancelButton" runat="server"
                Text="<%$ Resources: EPiServer, button.cancel %>"
                ToolTip="<%$ Resources: EPiServer, button.cancel %>"
                SkinID="Cancel"
                OnClick="CancelButton_Click"
                CausesValidation="False" />
        </div>
    </div>
</asp:Content>
