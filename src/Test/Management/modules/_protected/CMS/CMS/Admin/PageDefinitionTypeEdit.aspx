<%@ Page Language="c#" Codebehind="PageDefinitionTypeEdit.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.PageDefinitionTypeEdit"  Title="PageDefinitionTypeEdit" %>
<%@ Import Namespace="EPiServer"%>
<%@ Import Namespace="EPiServer.Core"%>
<%@ Import Namespace="System.Collections.Generic"%>
<%@ Import Namespace="EPiServer.Core.PropertySettings"%>

<asp:Content ContentPlaceHolderID="MainRegion" runat="server">

    <div class="epi-formArea">
        <div class="epi-size10">
            <div>
                <asp:Label runat="server" AssociatedControlID="typeName" Text="<%$ Resources: EPiServer, episerver.shared.header.name %>" />
                <asp:TextBox ID="typeName" Columns="25" runat="server" CssClass="EP-requiredField" />
                <asp:RequiredFieldValidator ControlToValidate="typeName" runat="server" ID="NameValidator">*</asp:RequiredFieldValidator>
            </div>

            <div>
                 <asp:Label runat="server" AssociatedControlID="typeTypeName" Text="<%$ Resources: EPiServer, admin.PageDefinitionTypeEdit.typenamecaption %>" />
                 <asp:TextBox ID="typeTypeName" Columns="50" runat="server" />
            </div>

            <div>
                 <asp:Label runat="server" AssociatedControlID="typeAssembly" Text="<%$ Resources: EPiServer, admin.PageDefinitionTypeEdit.assemblynamecaption %>" />
                 <asp:TextBox ID="typeAssembly" Columns="50" runat="server" />
            </div>

            <div>
                <asp:Label runat="server" AssociatedControlID="typeProperty" Text="<%$ Resources: EPiServer, admin.PageDefinitionTypeEdit.propertycaption %>" />
                <asp:DropDownList ID="typeProperty" runat="server" />
            </div>
        </div>

        <h4 class="delimiter"><asp:Literal runat="server" Text="<%$ Resources: EPiServer, admin.editpropertydefinition.typesettingsheader %>" /></h4>
        <asp:Literal runat="server" ID="NoSettingsMessage" Text="<%$ Resources: EPiServer, admin.editpropertydefinition.classhasnosettings %>" />

        <asp:Repeater ID="PropertyControlSettingsList" runat="server">
             <ItemTemplate>
                    <div class="epi-paddingVertical">

                        <h4 class="delimiter"><asp:Literal runat="server" Text='<%# TranslateWithFallback(((KeyValuePair<Type, IEnumerable<PropertySettingsWrapper>>)Container.DataItem).Key.Name) %>' /></h4>

                        <asp:Repeater DataSource="<%# ((KeyValuePair<Type, IEnumerable<PropertySettingsWrapper>>)Container.DataItem).Value %>" runat="server">
                            <HeaderTemplate>
                                <table class="epi-default" style="width: 100%;">
                                    <tr>
                                        <th><asp:Literal ID="Literal1" runat="server" Text="<%$ Resources: EPiServer, episerver.shared.header.name %>" /></th>
                                        <th><asp:Literal ID="Literal2" runat="server" Text="<%$ Resources: EPiServer, episerver.shared.header.description %>" /></th>
                                        <th><%: Translate("/admin/editcontenttype/fromcode") %></th>
                                        <th><asp:Literal ID="Literal3" runat="server" Text="<%$ Resources: EPiServer, admin.pagedefinitiontypeedit.isdefault %>" /></th>
                                    </tr>
                            </HeaderTemplate>
                            <ItemTemplate>
                                <tr>
                                    <td>
                                        <a href="#" onclick="OpenSettingsDialog('<%# ((PropertySettingsWrapper)Container.DataItem).Id %>')"><%# Server.HtmlEncode(((PropertySettingsWrapper)Container.DataItem).DisplayName) %></a>
                                    </td>
                                    <td>
                                        <%# Server.HtmlEncode(((PropertySettingsWrapper)Container.DataItem).Description) %>
                                    </td>
                                    <td>
                                        <%# ((PropertySettingsWrapper)Container.DataItem).DefinedByCode ? Translate("/episerver/shared/action/yes") : Translate("/episerver/shared/action/no") %>
                                    </td>
                                    <td>
                                        <asp:LinkButton runat="server"
                                                        Visible="<%# !((PropertySettingsWrapper)Container.DataItem).IsDefault && !((PropertySettingsWrapper)Container.DataItem).DefinedByCode %>"
                                                        Text="<%$ Resources: EPiServer, admin.pagedefinitiontypeedit.setdefault %>"
                                                        CommandName="SetDefault"
                                                        CommandArgument="<%# ((PropertySettingsWrapper)Container.DataItem).Id %>"
                                                        OnCommand="SetDefault" />

                                        <strong>
                                            <asp:Literal runat="server"
                                                     Visible="<%# ((PropertySettingsWrapper)Container.DataItem).IsDefault && ((PropertySettingsWrapper)Container.DataItem).DefinedByCode%>"
                                                     Text="<%$ Resources: EPiServer, admin.pagedefinitiontypeedit.defaultfromcode %>" />
                                            <asp:Literal runat="server"
                                                     Visible="<%# ((PropertySettingsWrapper)Container.DataItem).IsDefault && !((PropertySettingsWrapper)Container.DataItem).DefinedByCode%>"
                                                     Text="<%$ Resources: EPiServer, admin.pagedefinitiontypeedit.defaultfromadmin %>" />
                                        </strong>

                                        <asp:LinkButton runat="server"
                                                        Visible="<%# ((PropertySettingsWrapper)Container.DataItem).IsDefault && !((PropertySettingsWrapper)Container.DataItem).DefinedByCode %>"
                                                        Text="<%$ Resources: EPiServer, admin.pagedefinitiontypeedit.unsetdefault%>"
                                                        CommandName="RemoveDefault"
                                                        CommandArgument="<%# ((PropertySettingsWrapper)Container.DataItem).Id %>"
                                                        OnCommand="RemoveDefault" />
                                    </td>
                                </tr>
                            </ItemTemplate>
                            <FooterTemplate>
                                </table>
                            </FooterTemplate>
                        </asp:Repeater>

                         <div class="epi-buttonDefault">
                            <EPiServerUI:ToolButton runat="server" Text="<%$ Resources: EPiServer, admin.pagedefinitiontypeedit.addsetting %>" GeneratesPostBack="false" OnClientClick="<%# CreateDialogCall(((KeyValuePair<Type, IEnumerable<PropertySettingsWrapper>>)Container.DataItem).Key.AssemblyQualifiedName) %>" ToolTip="<%$ Resources: EPiServer, admin.pagedefinitiontypeedit.addglobalsetting %>" SkinID="Add" />
                        </div>

                    </div>

                </ItemTemplate>
            </asp:repeater>

        <div class="epi-buttonContainer">
            <EPiServerUI:ToolButton id="DeleteButton" DisablePageLeaveCheck="true" runat="server" text="<%$ Resources: EPiServer, button.delete %>" tooltip="<%$ Resources: EPiServer, button.delete %>" SkinID="Delete" OnClick="DeleteButton_Click" />
            <EPiServerUI:ToolButton id="ApplyButton" DisablePageLeaveCheck="true" runat="server" text="<%$ Resources: EPiServer, button.save %>" tooltip="<%$ Resources: EPiServer, button.save %>" SkinID="Save" OnClick="ApplyButton_Click" />
            <EPiServerUI:ToolButton id="CancelButton" CausesValidation="false" runat="server" text="<%$ Resources: EPiServer, button.cancel %>" tooltip="<%$ Resources: EPiServer, button.cancel %>" SkinID="Cancel" OnClick="CancelButton_Click" />
        </div>

    </div>

    <script type="text/javascript">

        function OpenSettingsDialog(value) {
            EPi.CreateDialog("EditPageTypeGlobalSettings.aspx?value=" + value, function (reload) { if (reload) { EPi.PageLeaveCheck.SetPageChanged(false); document.getElementById("<%= ReloadButton.ClientID %>").click(); } }, null, null, { width: 755, height: 400, resizable: "yes", scrollbars: "yes" });
        }

    </script>
    <asp:Button ID="ReloadButton" OnClick="Reload_Click" runat="server" style="display:none;" />


</asp:Content>
