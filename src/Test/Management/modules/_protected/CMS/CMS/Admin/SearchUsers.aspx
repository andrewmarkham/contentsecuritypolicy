<%@ Page Language="c#" Codebehind="SearchUsers.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.SearchUsers"  Title="Search Users" %>

<asp:Content ContentPlaceHolderID="MainRegion" runat="server">

    <script language="javascript" type="text/javascript">
     function ToggleSearchInputs(e) 
     {
        var searchByMembership = parseInt( this.options[ this.selectedIndex ].value ) == "1";
        var toggleRows = document.getElementById("ToggleRow");
        toggleRows.style.display = searchByMembership ? 'block' : 'none';
    }
    </script>

    <div runat="server" id="SearchDiv" class="epi-formArea epi-paddingVertical-small">
        <div class="epi-size15">
            <div>
                <asp:Label runat="server" AssociatedControlID="GroupSelection" Text="<%$ Resources: EPiServer, admin.searchusers.typecaption %>" />
                <asp:DropDownList ID="GroupSelection" runat="server" />
            </div>
            
            <div>
                <asp:Label runat="server" AssociatedControlID="FirstName" Text="<%$ Resources: EPiServer, admin.searchusers.searchname %>" />
                <asp:TextBox runat="server" ID="FirstName" MaxLength="50"></asp:TextBox>
            </div>
            
            <div id="ToggleRow">
                <asp:Label runat="server" AssociatedControlID="Email" Text="<%$ Resources: EPiServer, admin.secedit.editemail %>" />
                <asp:TextBox runat="server" ID="Email" MaxLength="50"></asp:TextBox>
            </div>
            
            <div>
                <asp:Label runat="server" AssociatedControlID="PagingSize" Text="<%$ Resources: EPiServer, admin.searchusers.pagingsize %>" />
                <asp:TextBox runat="server" ID="PagingSize" MaxLength="50">20</asp:TextBox>
            </div>
            
            <div id="ToolButtonDiv" runat="server" class="epi-indent">
                <EPiServerUI:ToolButton ID="SearchButton" OnClick="Search_Click" SkinID="Search" Text="<%$ Resources: EPiServer, button.search %>" ToolTip="<%$ Resources: EPiServer, button.search %>" runat="server" />
            </div>
        </div>
    </div>
    <div>
        <asp:DataGrid runat="server" ID="Grid" AllowPaging="True" OnDataBinding="SetHeaders" AutoGenerateColumns="False" OnPageIndexChanged="PageIndexChanged" UseAccessibleHeader="True">
            <PagerStyle Mode="NumericPages" CssClass="epipager" />
            <Columns>
                <asp:TemplateColumn Visible="true">
                    <ItemTemplate>
                        <%# GetTypeImage( DataBinder.Eval(Container.DataItem, "Type")) %>
                    </ItemTemplate>
                </asp:TemplateColumn>
                <asp:BoundColumn Visible="True" DataField="Name">
                    <ItemStyle></ItemStyle>
                </asp:BoundColumn>
                <asp:BoundColumn Visible="True" DataField="ProviderName">
                    <ItemStyle></ItemStyle>
                </asp:BoundColumn>
                <asp:BoundColumn Visible="True" DataField="Email">
                    <ItemStyle></ItemStyle>
                </asp:BoundColumn>
                <asp:BoundColumn Visible="True" DataField="Comment">
                    <ItemStyle></ItemStyle>
                </asp:BoundColumn>
                <asp:TemplateColumn Visible="true" HeaderStyle-HorizontalAlign="Center">
                    <ItemTemplate>
                        <%# GetApprovedImage( DataBinder.Eval(Container.DataItem, "IsApproved")) %>
                    </ItemTemplate>
                </asp:TemplateColumn>
                <asp:TemplateColumn Visible="true" HeaderStyle-HorizontalAlign="Center">
                    <ItemTemplate>
                        <%# GetLockedImage( DataBinder.Eval(Container.DataItem, "IsLocked")) %>
                    </ItemTemplate>
                </asp:TemplateColumn>
            </Columns>
        </asp:DataGrid>
    </div>
</asp:Content>
