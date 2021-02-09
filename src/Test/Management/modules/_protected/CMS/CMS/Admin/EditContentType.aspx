<%@ Page Language="c#" CodeBehind="EditContentType.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.EditContentType" Title="Edit Page Type" %>

<asp:Content ContentPlaceHolderID="HeaderContentRegion" runat="server">
    <script type="text/javascript" src="<%=EPiServer.Shell.Paths.ToClientResource("cms", "ClientResources/jquery.tablednd.js")%>"></script>
</asp:Content>

<asp:Content ContentPlaceHolderID="MainRegion" runat="server">
    <EPiServerUI:RefreshFrame ID="frameUpdater" FrameName="AdminMenu" runat="server" />
    <div class="epi-formArea epi-paddingHorizontal">
        <fieldset>
            <legend><span><%: Translate("/admin/contenttypeinformation/informationheading") %></span></legend>
            <dl>
                <asp:PlaceHolder ID="VersionInfo" runat="server" Visible="<%# ShouldShowVersionInfo %>">
                    <dt><%: Translate("/admin/contenttypeinformation/versioncaption") %></dt>
                    <dd><%: ContentTypeModel.Version %></dd>
                </asp:PlaceHolder>
                <asp:PlaceHolder ID="CodeInfo" runat="server" Visible="<%# ShouldShowCodeInfo %>">
                    <dt><%: Translate("/admin/editcontenttype/fromcode") %></dt>
                    <dd><%: Translate("/button/yes") %></dd>
                </asp:PlaceHolder>
                <dt><%: Translate("/admin/editpagetypesettings/namecaption") %></dt>
                <dd><%: ContentTypeModel != null ? ContentTypeModel.Name : ""%></dd>
                <dt><%: Translate("/admin/editpagetypesettings/basecaption") %></dt>
                <dd><%: ContentTypeModel != null ? ContentTypeModel.Base.ToString() : ""%></dd>
                <dt><%: Translate("/admin/contenttypeinformation/displaynamecaption") %></dt>
                <dd><%: ContentTypeModel != null ? ContentTypeModel.DisplayName : "" %></dd>
            </dl>
            <div class="floatright">
                <EPiServerUI:ToolButton ID="SettingsButton" runat="server" Text="<%$ Resources: EPiServer, button.settings %>" ToolTip="<%$ Resources: EPiServer, button.settings %>" SkinID="File" OnClick="SettingsButton_Click" />
            </div>
        </fieldset>
    </div>
    <div class="epi-buttonDefault">
        <EPiServerUI:ToolButton ID="NewDefinitionButton" runat="server" Text="<%$ Resources: EPiServer, admin.editcontenttype.addproperty %>" ToolTip="<%$ Resources: EPiServer, admin.editcontenttype.addproperty %>" SkinID="Add" OnClick="NewDefinitionButton_Click" />
    </div>
    <asp:PlaceHolder runat="server" ID="SortScript">
        <script type="text/javascript">
            function hideSortButtons()
            {
                $(".epi-table-sortable .epi-sort-increase, .epi-table-sortable .epi-sort-decrease").show();
                $(".epi-table-sortable tr:first-child .epi-sort-increase").hide();
                $(".epi-table-sortable tr:last-child .epi-sort-decrease").hide();
            }

            $(document).ready(function () {
                hideSortButtons();

                // Initialise the table
                $(".epi-table-sortable").tableDnD(
                    {
                        onDragClass: "epi-table-sortableRow-drag",
                        onDrop: function (table, row) {
                            var rows = table.tBodies[0].rows;
                            var newpropertyOrder = "";
                            for (var i = 0; i < rows.length; i++) {
                                if (i > 0) { newpropertyOrder += "," }
                                newpropertyOrder += rows[i].id;
                            }
                            $.ajax({
                                type: 'POST',
                                data: 'newPropertyOrder=' + newpropertyOrder,
                                dataType: 'json',
                                processData: false,
                                success: function (e) {
                                    hideSortButtons();
                                }
                            });
                        }
                    });
            });
        </script>
    </asp:PlaceHolder>
    <asp:Repeater ID="PropertyList" ItemType="EPiServer.DataAbstraction.PropertyDefinition" runat="server">
        <HeaderTemplate>
            <table class="epi-default epi-table-sortable">
                <thead>
                    <tr class="nodrop nodrag"> <!-- The header should not be dragable nor droppable -->
                        <asp:PlaceHolder runat="server" Visible="<%# !CodeOnly %>">
                            <th><!-- Move up --></th>
                            <th><!-- Move down --></th>
                        </asp:PlaceHolder>
                        <th><EPiServer:Translate runat="server" Text="/admin/editpropertydefinition/namecaption" /></th>
                        <th><EPiServer:Translate runat="server" Text="/admin/editpropertydefinition/editcaption" /></th>
                        <th><EPiServer:Translate runat="server" Text="/admin/editpropertydefinition/typecaption" /></th>
                        <th><EPiServer:Translate runat="server" Text="/admin/editcontenttype/propertyrequired" /></th>
                        <th><EPiServer:Translate runat="server" Text="/admin/editcontenttype/propertylocalized" /></th>
                        <th><EPiServer:Translate runat="server" Text="/admin/editcontenttype/propertysearchable" /></th>
                        <th><EPiServer:Translate runat="server" Text="/admin/editpropertydefinition/advancedcaption" /></th>
                        <asp:PlaceHolder runat="server" Visible="<%# !String.IsNullOrEmpty(ContentTypeModel.ModelTypeString) %>">
                            <th><EPiServer:Translate runat="server" Text="/admin/editcontenttype/fromcode" /></th>
                        </asp:PlaceHolder>
                    </tr>
                </thead>
                <tbody>
        </HeaderTemplate>
        <ItemTemplate>
            <tr id='<%# Item.ID %>'>
                <asp:PlaceHolder runat="server" Visible="<%# !CodeOnly %>">
                <td align="center">
                    <asp:ImageButton OnCommand="MoveUp_Click" CommandName='<%# Item.ID %>' runat="server" ID="Imagebutton1" NAME="Imagebutton1" class="epi-sort-increase" style="cursor:pointer;" />
                </td>
                <td align="center">
                    <asp:ImageButton OnCommand="MoveDown_Click" CommandName='<%# Item.ID %>' runat="server" ID="Imagebutton2" class="epi-sort-decrease" style="cursor:pointer;" />
                </td>
                </asp:PlaceHolder>
                <td>
                    <a href="EditPropertyDefinition.aspx?typeId=<%# Item.ID %>" title='<%#: Item.TranslateDescription() %>'>
                        <%#: Item.Name %>
                    </a>
                </td>
                <td >
                    <%#: Item.TranslateDisplayName() %>
                </td>
                <td>
                    <asp:PlaceHolder runat="server" ID="BlockLinkHolder" Visible="<%# IsBlock(Item) %>">
                        <%# Translate("/admin/editpropertydefinition/typeblock")%>
                        (<a href="<%# GetPropertyTypeLinkUrl(Item) %>"><%#: GetPropertyType(Item) %></a>)
                    </asp:PlaceHolder>
                    <asp:PlaceHolder runat="server" ID="PropertyTypeText" Visible="<%# !IsBlock(Item) %>">
                        <%#: GetPropertyType(Item) %>
                    </asp:PlaceHolder>
                </td>
                <td align="center">
                    <%# Item.Required ? Translate("/button/yes") : string.Empty %>
                </td>
                <td align="center">
                    <%# Item.LanguageSpecific ? Translate("/button/yes") : string.Empty %>
                </td>
                <td align="center">
                    <%# Item.Searchable ? Translate("/button/yes") : string.Empty%>
                </td>
                <td>
                    <%#: Item.Tab.LocalizedName %>
                </td>
                <asp:PlaceHolder runat="server" Visible="<%# !string.IsNullOrEmpty(ContentTypeModel.ModelTypeString) %>">
                    <td>
                        <asp:Literal runat="server" Visible="<%# Item.ExistsOnModel && !IsMissingModelProperty(Item) %>" Text='<%# Translate("/button/yes") %>' />
                        <asp:Literal runat="server" Visible="<%# IsMissingModelProperty(Item) %>" Text='<%# Translate("/admin/editcontenttype/propertymissingonmodel") %>' />
                    </td>
                </asp:PlaceHolder>
            </tr>
        </ItemTemplate>
        <FooterTemplate>
                </tbody>
            </table>
        </FooterTemplate>
    </asp:Repeater>
</asp:Content>
