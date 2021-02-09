<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="MySettings.aspx.cs" Inherits="EPiServer.UI.Edit.MySettings" %>

<asp:Content ContentPlaceHolderID="MainContent" runat="server">
    <div class="epi-contentArea">
        <EPiServerUI:SystemPrefix ID="componentsPrefix" runat="server" />
        <asp:validationsummary id="ValidationSummary" runat="server" cssclass="EP-validationSummary" forecolor="Black"/>
    </div>
    <asp:Panel runat="server" ID="settingsPanel"></asp:Panel>    
</asp:Content>