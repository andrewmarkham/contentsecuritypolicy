<%@ Page Language="c#" Codebehind="Tabs.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.Tabs"  Title="Tabs" %>
<%@ Import Namespace="EPiServer.DataAbstraction" %>

<asp:Content ID="MainContent" ContentPlaceHolderID="MainRegion" runat="server">

    <asp:Panel ID="TabListPanel" runat="server">
        <div class="epi-buttonDefault">
            <EPiServerUI:ToolButton ID="AddButton" SkinID="Add" OnClick="AddButton_Click" Text="<%$ Resources: EPiServer, button.add %>" ToolTip="<%$ Resources: EPiServer, button.add %>" runat="server" />
        </div>
        
        <EPiServerScript:ScriptSettings runat="server" ConfirmMessage="<%$ Resources: EPiServer, admin.headings.confirmdelete %>" ID="deleteCommon" />
        
        <asp:GridView
            ID="DataViewControl"
            runat="server" 
            DataSourceID="DataSourceControl" 
            AutoGenerateColumns="false" 
            DataKeyNames="ID" 
            OnRowEditing="DataViewControl_RowEditing" 
            OnRowCancelingEdit="DataViewControl_CancelEdit" 
            OnRowDeleting="DataViewControl_DeleteRow" 
            OnRowUpdating="DataViewControl_UpdateRow">
            <Columns>
                <asp:TemplateField HeaderText="<%$ Resources: EPiServer, admin.tabs.name %>" ItemStyle-Wrap="false">                
                    <ItemTemplate>
                        <%# HttpUtility.HtmlEncode(Eval("Name").ToString()) %>
                    </ItemTemplate>
                    <EditItemTemplate>
                        <asp:TextBox ID="TabName" MaxLength="100" Text='<%# Bind("Name") %>' CssClass="EP-requiredField" runat="server" />
                        <asp:RequiredFieldValidator ID="ValidatorTabName" ControlToValidate="TabName" Text="*" ErrorMessage="<%$ Resources: EPiServer, admin.tabs.missingtabname %>" EnableClientScript="true" Display="Dynamic" runat="server" />
                        <EPiServerScript:ScriptSetFocusEvent EventType="Load" EventTargetID="<%# Page.ClientID %>" FocusControlID="TabName" SetFocus="true" SetSelect="true" runat="server" />
                    </EditItemTemplate>
                </asp:TemplateField>
                 <asp:TemplateField HeaderText="<%$ Resources: EPiServer, admin.tabs.displayname %>" ItemStyle-Wrap="false">                
                    <ItemTemplate>
                        <%# HttpUtility.HtmlEncode((Eval("DisplayName") ?? String.Empty).ToString()) %>
                    </ItemTemplate>
                    <EditItemTemplate>
                        <asp:TextBox ID="TabDisplayName" MaxLength="100" Text='<%# Bind("DisplayName") %>' CssClass="EP-requiredField" runat="server" />
                    </EditItemTemplate>
                </asp:TemplateField>
                <asp:TemplateField HeaderText="<%$ Resources: EPiServer, admin.headings.tablesortindex %>" ItemStyle-Wrap="false">
                    <ItemTemplate>
                        <%# Eval("SortIndex") %>
                    </ItemTemplate>
                    <EditItemTemplate>
                        <asp:TextBox ID="TabSortIndex" SkinID="Size50" Text='<%# Bind("SortIndex") %>' CssClass="EP-requiredField" runat="server" />
                        <asp:RequiredFieldValidator ID="ValidatorSortIndex" ControlToValidate="TabSortIndex" Text="*" ErrorMessage="<%$ Resources: EPiServer, admin.tabs.missingsortindex %>" EnableClientScript="true" Display="Dynamic" runat="server" />
                        <asp:RangeValidator Type="Integer" MinimumValue="0" MaximumValue="10000" ControlToValidate="TabSortIndex" Text="*" ErrorMessage="<%# GetSortIndexOutOfRangeMessage() %>" Display="Dynamic" runat="server" />
                    </EditItemTemplate>
                </asp:TemplateField>
                <asp:TemplateField HeaderText="<%$ Resources: EPiServer, admin.headings.tableaccesslevel %>">
                    <ItemTemplate>
                        <%# GetAccessLevelName(Eval("RequiredAccess"))%>
                    </ItemTemplate>
                    <EditItemTemplate>
                        <asp:DropDownList SkinID="Size140" runat="server" OnDataBinding="AccessDropDown_DataBinding" SelectedValue='<%# Bind("RequiredAccess") %>' ID="AccessDropDown" />
                    </EditItemTemplate>
                </asp:TemplateField>
                <asp:TemplateField HeaderText="<%$ Resources: EPiServer, admin.tabs.fromcode %>"   ItemStyle-HorizontalAlign="Center">
                    <ItemTemplate   >
                        <asp:Label runat="server" Text='<%# DefinedByCode(Container.DataItem) %>' ></asp:Label>
                    </ItemTemplate>
                    <EditItemTemplate/>
                </asp:TemplateField>
                <asp:TemplateField HeaderText="<%$ Resources: EPiServer, button.edit %>" ItemStyle-Wrap="false" ItemStyle-HorizontalAlign="Center">
                    <ItemTemplate>
                        <EPiServerUI:ToolButton CommandName="Edit" SkinID="Edit" CausesValidation="false" ToolTip="<%$ Resources: EPiServer, button.edit %>" Enabled='<%# ButtonEnabled( Container.DataItemIndex ) && Editable(Container.DataItem)%>' runat="server" /> 
                    </ItemTemplate>
                    <EditItemTemplate>
                        <EPiServerUI:ToolButton CommandName="Update" SkinID="Save" CausesValidation="true" ToolTip="<%$ Resources: EPiServer, button.save %>" Enabled='<%# ButtonEnabled( Container.DataItemIndex ) && Editable(Container.DataItem) %>' runat="server" /><EPiServerUI:ToolButton CommandName="Cancel" SkinID="Cancel" CausesValidation="false" ToolTip="<%$ Resources: EPiServer, button.cancel %>" Enabled="<%# ButtonEnabled( Container.DataItemIndex )%>" runat="server" />
                    </EditItemTemplate>
                </asp:TemplateField>
                <asp:TemplateField HeaderText="<%$ Resources: EPiServer, button.delete %>" ItemStyle-HorizontalAlign="Center">
                    <ItemTemplate>
                        <EPiServerUI:ToolButton ID="deleteTool" CommandName="Delete" SkinID="Delete" EnableClientConfirm="true" ToolTip="<%$ Resources: EPiServer, button.delete %>" Enabled='<%# !(bool)Eval("IsSystemTab") && ButtonEnabled( Container.DataItemIndex ) && Editable(Container.DataItem)%>' runat="server" /> 
                        <EPiServerScript:ScriptSettings runat="server" TargetControlID="deleteTool" CommonSettingsControlID="deleteCommon" Name='<%# Eval("Name") %>' />
                    </ItemTemplate>
                    <EditItemTemplate>
                    </EditItemTemplate>
                </asp:TemplateField>
            </Columns>
        </asp:GridView>
    </asp:Panel>

    <asp:Panel ID="DependencyPanel" runat="server" Visible="false">
        <asp:BulletedList ID="DependencyList" runat="server" />
        <p>
            <asp:Label Text="<%$ Resources: EPiServer, admin.tabs.referencedheadinghelp %>" runat="server" />
        </p>
        <asp:DropDownList ID="DependencyTransferDropdown" runat="server" DataValueField="ID" DataTextField="Name"></asp:DropDownList>
        <EPiServerUI:ToolButton ID="DeleteConfirm" SkinID="Check" OnCommand="DeleteConfirm_Click" ToolTip="<%$ Resources: EPiServer, button.delete %>" runat="server" /><EPiServerUI:ToolButton ID="DeleteCancel" SkinID="Cancel" OnCommand="DeleteCancel_Click" ToolTip="<%$ Resources: EPiServer, button.cancel %>" runat="server" />
    </asp:Panel>

    <EPiServer:TabDefinitionDataSource runat="server" ID="DataSourceControl" />

</asp:Content>
