<%@ Page Language="C#" AutoEventWireup="false" CodeBehind="ContentProviderMirroring.aspx.cs" Inherits="EPiServer.UI.Admin.ContentProviderMirroring"  Title="MirroringInfo" %>
<asp:Content ContentPlaceHolderID="MainRegion" runat="server">     
    <asp:Panel Visible="true" ID="listPanel" runat="server">
        <div class="epi-buttonDefault">
            <EPiServerUI:ToolButton ID="ToolButton3" OnClick="OnSelectedType" runat="server" Text="<%$ Resources: EPiServer, button.create %>" ToolTip="<%$ Resources: EPiServer, button.create %>" SkinID="Add" />
        </div>
        <asp:Repeater ID="MirroringList" runat="server">
            <HeaderTemplate>
                <table width="40%" class="epi-default">
                    <tr>
                        <th>
                            <EPiServer:Translate Text="#name" runat="server" ID="Translate2" />
                        </th>
                         <th>
                            <EPiServer:Translate Text="#laststatus" runat="server" ID="Translate3" />
                        </th>
                        <th>
                            <EPiServer:Translate Text="#lastexecution" runat="server" ID="Translate4" />
                        </th>
                        <th>
                            <EPiServer:Translate Text="#laststate" runat="server" ID="Translate1" />
                        </th>

                    </tr>
            </HeaderTemplate>
            <ItemTemplate>
                <tr>
                    <td>
                        <a href="ContentMirroringServiceEdit.aspx?channel=<%#DataBinder.Eval(Container.DataItem,"ID.ExternalId")%>">
                            <%#HttpUtility.HtmlEncode(((EPiServer.MirroringService.MirroringData)Container.DataItem).Name)%>
                        </a>
                    </td>
                    <td>
                         <%#((EPiServer.MirroringService.MirroringData)Container.DataItem).LastStatus%>
                    </td>
                    <td>
                         <%# GetLastExecutionDate((EPiServer.MirroringService.MirroringData)Container.DataItem)%>
                    </td>
                    <td>
                        <img src='<%# CheckState(((EPiServer.MirroringService.MirroringData)Container.DataItem))%>' runat="server" alt="" />
                    </td>                    
                </tr>
            </ItemTemplate>
            <FooterTemplate>
                </table>
            </FooterTemplate>
        </asp:Repeater>
    </asp:Panel>
    
</asp:Content>

