<%@ Page Language="c#" Codebehind="PageDefinitionType.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.PageDefinitionType"  Title="PageDefinitionType" %>

<asp:Content ID="Content1" ContentPlaceHolderID="MainRegion" runat="server">
    <div class="epi-buttonDefault">
        <EPiServerUI:ToolButton id="createNew" runat="server" text="<%$ Resources: EPiServer, button.create %>" tooltip="<%$ Resources: EPiServer, button.create %>" SkinID="Add" OnClick="CreateNew_Click" />
    </div>
    <asp:Repeater ID="typeList" runat="server">
        <HeaderTemplate>
            <table class="epi-default">
                <tr>
                    <th>
                        <episerver:translate text="/episerver/shared/header/name" runat="server" id="Translate11" />
                    </th>
                    <th>
                        <episerver:translate text="/admin/pagedefinitiontypeedit/propertycaption" runat="server" id="Translate3" />
                    </th>
                    <th>
                        <episerver:translate text="/admin/pagedefinitiontypeedit/typenamecaption" runat="server" id="Translate1" />
                    </th>
                    <th>
                        <episerver:translate text="/admin/pagedefinitiontypeedit/assemblynamecaption" runat="server" id="Translate2" />
                    </th>
                </tr>
        </HeaderTemplate>
        <ItemTemplate>
            <tr>
                <td>
                    <a href="PageDefinitionTypeEdit.aspx?typeId=<%# DataBinder.Eval(Container.DataItem, "ID") %>">
                        <%#: DataBinder.Eval(Container.DataItem, "LocalizedName") %>
                    </a>
                </td>
                <td>
                    <%# EPiServer.Core.PropertyData.Translate(DataBinder.Eval(Container.DataItem, "DataType").ToString()) %>
                </td>
                <td>
                    <%# DataBinder.Eval(Container.DataItem, "TypeName") %>
                </td>
                <td>
                    <%# DataBinder.Eval(Container.DataItem, "AssemblyName") %>
                </td>
            </tr>
        </ItemTemplate>
        <FooterTemplate>
            </table></FooterTemplate>
    </asp:Repeater>
</asp:Content>
