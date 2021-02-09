<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="ContentTypeMenuList.ascx.cs" Inherits="EPiServer.UI.Admin.ContentTypeMenuList" %>
<div class="epi-localNavigation">
    <ul>
        <li class="epi-navigation-standard epi-navigation-selected">
            <a href="#ContentTypeListDiv">
                <%: HeaderText %>
            </a>
            <span class="EPAdmin-menuTypeSorting">
                <asp:PlaceHolder runat="server" ID="ContentTypeSorting" Visible="True">
                    <img id="Img1" class="EPEdit-CommandToolClicked" style="vertical-align: bottom;"
                        src="<%=GetImageThemeUrl("AdminMenu/IndexSort.gif")%>" alt="<%=Translate("/admin/menuheadings/pagetypesorting/sortbyindex")%>"
                        title="<%=Translate("/admin/menuheadings/pagetypesorting/sortbyindex")%>" data-list="<%: UnorderedList.ClientID %>" data-order="index" />
                    <img id="Img2" class="EPEdit-CommandTool" style="vertical-align: bottom;"
                        src="<%=GetImageThemeUrl("AdminMenu/AlphabeticalSort.gif")%>" alt="<%=Translate("/admin/menuheadings/pagetypesorting/sortalphabetically")%>"
                        title="<%=Translate("/admin/menuheadings/pagetypesorting/sortalphabetically")%>" data-list="<%: UnorderedList.ClientID %>" data-order="alphabetical" />
                </asp:PlaceHolder>
            </span>
            <ul runat="server" ID="UnorderedList">
                <asp:Repeater runat="server" ID="ContentTypeList">
                    <ItemTemplate>
                        <li><a class="epi-navigation-global_user_settings_shell_search " href="EditContentType.aspx?typeId=<%# DataBinder.Eval(Container.DataItem, "ID") %>"
                            id='<%# DataBinder.Eval(Container.DataItem, "SortOrder")%>' title="<%# Server.HtmlEncode(GetContentTypeName(Container.DataItem)) %>">
                            <div class="<%# GetWarningCssClass(Container.DataItem) %>"><%# Server.HtmlEncode(GetContentTypeName(Container.DataItem))%></div>
                            <div class="clear"></div>
                        </a>
                        </li>
                    </ItemTemplate>
                </asp:Repeater>
                <asp:PlaceHolder runat="server" ID="NoContentTypesInfo" Visible="False">
                    <li>
                        <EPiServer:Translate ID="Translate2" Text="/admin/menuheadings/nocontenttypestext" runat="server" />
                    </li>
                </asp:PlaceHolder>
            </ul>
        </li>
    </ul>
</div>
