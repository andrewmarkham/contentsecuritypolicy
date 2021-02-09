<%@ Page Language="c#" Codebehind="CopyPageType.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.CopyPageType"  Title="CopyPageType" %>

<asp:Content ContentPlaceHolderID="MainRegion" runat="server">
<div class="epi-formArea">
    <div class="epi-size50">
        <div>
            <asp:Label runat="server" AssociatedControlID="pageTypeList" Translate="#caption" />
            <asp:DropDownList ID="pageTypeList" runat="server" />
            <EPiServerUI:ToolButton OnClick="Copy" runat="server" Text="<%$ Resources: EPiServer, button.copy %>" ToolTip="<%$ Resources: EPiServer, button.copy %>" SkinID="Copy" />
        </div>
    </div>        
</div>
</asp:Content>
