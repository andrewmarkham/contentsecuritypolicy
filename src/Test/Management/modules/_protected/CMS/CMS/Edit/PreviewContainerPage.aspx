<%@ Page Language="C#" AutoEventWireup="false" CodeBehind="PreviewContainerPage.aspx.cs"
    Inherits="EPiServer.UI.Edit.PreviewContainerPage"  %>

<%@ Register Namespace="EPiServer.Web.WebControls" TagPrefix="EPiServer" %>
<asp:Content ID="Content1" ContentPlaceHolderID="FullRegion" runat="server">
    <EPiServerUI:BodySettings CssClass="epiemptybackground" runat="server" />
    <div class="epieditpaneltitle">
        <span class="EP-systemMessage">
            <episerver:translate runat="server" text="/edit/editpanel/previewdatapageinfo" />
        </span>
    </div>
</asp:Content>
