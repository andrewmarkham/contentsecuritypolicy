<%@ Page Language="C#" AutoEventWireup="false" CodeBehind="FileSaveAs.aspx.cs" Inherits="EPiServer.UI.Edit.ImageEditor.FileSaveAs"  %>
<%@ Register TagPrefix="EPiServer" Namespace="EPiServer.Web.WebControls" Assembly="EPiServer" %>

<asp:Content ContentPlaceHolderID="HeaderContentRegion" runat="server">
    <script type="text/javascript">
        function resizeWindow()
        {
            var scrollSize = document.body.scrollHeight - document.body.offsetHeight;
            if (scrollSize > 0)
                window.resizeBy(0, scrollSize + 10);
        }
    </script>
    <EPiServerScript:ScriptEvent runat="server" EventTargetClientNode="window" EventType="Load" EventHandler="resizeWindow" />
</asp:Content> 

<asp:Content ID="MainRegion" runat="server" ContentPlaceHolderID="FullRegion">
    <div class="epi-formArea">
        <div class="epi-paddingHorizontal">
            <asp:ValidationSummary runat="server" EnableClientScript="true" CssClass="errormessage" />
        </div>
         <div class="epi-paddingHorizontal">
            <asp:Label runat="server" ID="ErrorLabel" />
        </div>
        <asp:Panel runat="server" ID="AutoSavePanel" Visible="false" CssClass="epi-paddingHorizontal epi-contentArea">
            <fieldset runat="server" id="ReferencingContentArea">
                <legend>
                    <asp:Literal runat="server" Text="<%$ Resources: EPiServer, edit.imageeditor.saveas.fileusageheading %>" />
                </legend>
                <div>
                    <asp:Repeater runat="server" ID="ReferencingPages" EnableViewState="false">
                        <HeaderTemplate>
                            <ul>
                        </HeaderTemplate>
                        <ItemTemplate>
                            <li>
                                <asp:HyperLink runat="server" Target="_blank" Text="<%# ((Tuple<string, string>)Container.DataItem).Item1 %>" NavigateUrl="<%# ((Tuple<string, string>)Container.DataItem).Item2 %>" />
                            </li>
                        </ItemTemplate>
                        <FooterTemplate>
                            </ul>
                        </FooterTemplate>
                    </asp:Repeater>
                    <asp:Literal runat="server" ID="AdditionalPageCount"/>
                </div>
            </fieldset>
            
            <div class="epirowcontainer">
                <asp:Literal runat="server" ID="ConfirmReplaceText" Text="<%$ Resources: EPiServer, edit.imageeditor.saveas.confirmareplaceimage %>" />
            </div>
    
            <div class="epitoolbuttonrowrightaligned">
                <EPiServerUI:ToolButton IsDialogButton="True" Id="SaveButton" SkinID="Save" OnClick="AutoSaveFile_Click" Text="<%$ Resources: EPiServer, button.ok %>" ToolTip="<%$ Resources: EPiServer, button.ok %>" runat="server"/>
                <EPiServerUI:ToolButton IsDialogButton="True" OnClientClick="EPi.GetDialog().Close()" GeneratesPostBack="false" SkinID="Cancel" Text="<%$ Resources: EPiServer, button.cancel %>" ToolTip="<%$ Resources: EPiServer, button.cancel %>" runat="server"/>            
            </div>
        </asp:Panel>

        <asp:Panel ID="FileManagerSaving" runat="server" Visible="false" CssClass="epi-paddingHorizontal">
            <fieldset>
                <legend><asp:Literal Text="<%$ Resources: EPiServer, edit.imageeditor.saveas.saveasheading %>" runat="server" /></legend>
                <div class="epirowcontainer">
                    <EPiServer:Translate Text="<%$ Resources: EPiServer, edit.imageeditor.saveas.filename %>" runat="server" />
                    <asp:TextBox ID="TxtFileName" runat="server" CssClass="EP-requiredField" SkinID="Size200" />
                    <asp:Literal runat="server" ID="ImageExtension" />
                    <asp:RequiredFieldValidator runat="server" EnableClientScript="true" ControlToValidate="TxtFileName" Text="*" ErrorMessage="<%$ Resources: EPiServer, edit.imageeditor.saveas.emptyfilename %>" />
                    <asp:RegularExpressionValidator runat="server" ID="FileNameRegexValidator" EnableClientScript="true" ControlToValidate="TxtFileName" Text="*" />
                    <asp:CustomValidator runat="server" ID="FileNameValidator" ControlToValidate="TxtFileName" OnServerValidate="FileNameValidator_ServerValidate" Text="*" ErrorMessage="" />
                </div>
            </fieldset>
       
            <div class="epitoolbuttonrowrightaligned">
                <EPiServerUI:ToolButton id="OkButton" IsDialogButton="True" SkinID="Save" OnClick="SaveFile_Click" Text="<%$ Resources: EPiServer, button.ok %>" ToolTip="<%$ Resources: EPiServer, button.ok %>" runat="server"/>
                <EPiServerUI:ToolButton id="CancelButton" IsDialogButton="True" OnClientClick="EPi.GetDialog().Close()" GeneratesPostBack="false" SkinID="Cancel" Text="<%$ Resources: EPiServer, button.cancel %>" ToolTip="<%$ Resources: EPiServer, button.cancel %>" runat="server"/>            
            </div>
        </asp:Panel>
    </div>
</asp:Content>