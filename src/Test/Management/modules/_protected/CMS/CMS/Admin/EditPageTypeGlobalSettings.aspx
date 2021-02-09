<%@ Page Language="C#" AutoEventWireup="false" CodeBehind="EditPageTypeGlobalSettings.aspx.cs"  Inherits="EPiServer.UI.Admin.EditPageTypeGlobalSettings" %>
<%@ Import Namespace="EPiServer.Core.PropertySettings"%>
<asp:Content ContentPlaceHolderID="FullRegion" runat="server">
 
    <script type="text/javascript">
     
        function CloseDialog() {
            EPi.GetDialog().Close(true);
        } 

        // Resize Dynamic Content dialog according to content size of SettingsAdapter,
        // Max height is 600px, if SettingsAdapter is larger a scrollbar will be available.
        // Set global var doNotResize = true to disable the automatic resize.
        function ResizeDialog() {
            var node = document.getElementById("settingsContainer");
            if (node == null) { return; } 

            var orgWidth = width = node.offsetWidth; 

            for (var i = 0; i < node.childNodes.length; i++) { 
                if (node.childNodes[i].offsetWidth > width) {
                    width = node.childNodes[i].offsetWidth;
                }
            }
   
            width = width - document.documentElement.clientWidth + 52;

            if (width < 0) {
                width = 0;
            }

            var formHeight = EPi.GetForm().offsetHeight;
            var height = formHeight < 600 ? formHeight : 600;
            
            window.resizeBy(width, height + 5 - document.documentElement.clientHeight);

        }

        if (typeof (doNotResize) == "undefined" || doNotResize == false) {
            EPi.AddEventListener(window, "load", ResizeDialog);
        }
        
    </script>

    <div class="epi-formArea epi-paddingHorizontal" style="zoom:1;">
        <div class="epi-contentArea">
            <asp:ValidationSummary runat="server" CssClass="EP-validationSummary" ForeColor="Black" />
        </div>

        <fieldset>
            <legend><asp:Literal runat="server" Text="<%$ Resources: EPiServer, admin.editpagetypeglobalsettings.common %>" /></legend>
        
            <div class="epi-size10">
                <div>
                    <asp:label runat="server" AssociatedControlID="DisplayName" Text="<%$ Resources: EPiServer, admin.editpagetypeglobalsettings.name %>" />
                    <asp:TextBox ID="DisplayName" Columns="25" runat="server" CssClass="EP-requiredField" />
                    <asp:RequiredFieldValidator runat="server" ControlToValidate="DisplayName" ErrorMessage="<%$ Resources: EPiServer, admin.editpagetypeglobalsettings.displaynameerror %>" Text="*" />
                </div>
                <div>
                    <asp:label runat="server" AssociatedControlID="Description" Text="<%$ Resources: EPiServer, episerver.shared.header.description %>" />
                    <asp:TextBox ID="Description" Columns="25" Rows="2" TextMode="MultiLine" runat="server" CssClass="EP-requiredField" />
                </div>
            </div>
            
        </fieldset>
    
        <fieldset id="settingsControlFieldset">
            <legend><asp:Literal runat="server" Text="<%$ Resources: EPiServer, admin.editpagetypeglobalsettings.typesettingsheader %>" /></legend>
                <div id="settingsContainer">        
                    <asp:PlaceHolder runat="server" ID="SettingsControl" />
                </div>
        </fieldset>
 
        <div class="epi-paddingVertical epi-floatRight">
            <EPiServerUI:ToolButton ID="SaveButton" Enabled="true" DisablePageLeaveCheck="true" OnClick="SaveButton_Click" runat="server" Text="<%$ Resources: EPiServer, button.save %>" Tooltip="<%$ Resources: EPiServer, button.save %>" SkinID="Save" /><EPiServerUI:ToolButton ID="SaveCopyButton" Enabled="true" DisablePageLeaveCheck="true" OnClick="SaveCopyButton_Click" runat="server" Text="<%$ Resources: EPiServer, button.savecopy %>" Tooltip="<%$ Resources: EPiServer, button.savecopy %>" SkinID="Save" /><EPiServerUI:ToolButton ID="DeleteButton" Enabled="true" DisablePageLeaveCheck="true" OnClick="DeleteButton_Click" runat="server" EnableClientConfirm="true" ConfirmMessage="<%$ Resources: EPiServer,  admin.editpagetypeglobalsettings.deletemessage %>" Text="<%$ Resources: EPiServer, button.delete %>" Tooltip="<%$ Resources: EPiServer, button.delete %>" SkinID="Delete" /><EPiServerUI:ToolButton ID="CancelButton" Enabled="true" DisablePageLeaveCheck="true" GeneratesPostBack="false" OnClientClick="EPi.GetDialog().Close(false);" runat="server" Text="<%$ Resources: EPiServer, button.cancel %>" Tooltip="<%$ Resources: EPiServer, button.cancel %>" SkinID="Cancel" />
        </div>
    
    </div>

</asp:Content>