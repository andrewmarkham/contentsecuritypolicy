<%@ Page Language="C#" AutoEventWireup="false" CodeBehind="ErrorMessage.aspx.cs" Inherits="EPiServer.UI.Admin.ErrorMessage"  %>

<asp:Content runat="server" ContentPlaceHolderID="FullRegion">

    <div class="epi-contentContainer epi-padding">
        <div class="epi-contentArea">
            <asp:ValidationSummary ID="ValidationSummary" runat="server" CssClass="EP-validationSummary" ForeColor="Black" />
        </div>
    </div>

</asp:Content>

