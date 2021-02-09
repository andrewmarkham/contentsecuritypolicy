<%@ Page Language="C#" AutoEventWireup="false" CodeBehind="Start.aspx.cs" Inherits="EPiServer.UI.Report.Start"  %>

<asp:Content ContentPlaceHolderID="MainRegion" runat="server">
    <div class="epireportregion">
        <div class="epipane">
            <div class="epireportcenterstartimage">
                <EPiServer:ThemeImage AlternateText="<%$ Resources: EPiServer, reportcenter.startpage.helpimagetext %>" ImageUrl="ReportCenter/StartPageHelp.png" runat="server" />
            </div>
            <p><asp:Literal runat="server" Text="<%$ Resources: EPiServer, reportcenter.startpage.info %>" /></p>
        </div>
    </div>
</asp:Content>