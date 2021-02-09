<%@ Page Language="c#" Codebehind="Frames.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.Frames"  Title="Frames" %>

<asp:Content ID="Content1" ContentPlaceHolderID="MainRegion" runat="server">
    <div class="epi-buttonDefault">
        <EPiServerUI:ToolButton id="AddRowButton" OnClick="AddNewRow" runat="server" SkinID="Add" text="<%$ Resources: EPiServer, button.add %>" ToolTip="<%$ Resources: EPiServer, button.add %>" />
    </div>
    <EPiServerScript:ScriptSettings runat="server" ConfirmMessage="<%$ Resources: EPiServer, admin.frames.confirmdelete %>" ID="deleteCommon" />
    <asp:DataGrid ID="Grid" runat="server" 
        AutoGenerateColumns="False" 
        OnEditCommand="EditRow" 
        OnDeleteCommand="DeleteRow" 
        OnUpdateCommand="SaveRow" 
        OnCancelCommand="CancelEditing"
        UseAccessibleHeader="true" DataKeyField="ID">
        <Columns>
            <asp:TemplateColumn HeaderText="<%$ Resources: EPiServer, admin.frames.tablename %>">
                <ItemTemplate>
                    <%# Server.HtmlEncode(Eval("Name") as string)%>
                </ItemTemplate>
                <EditItemTemplate>
                    <asp:TextBox SkinID="Small" ID="FrameName" CssClass="EP-requiredField" runat="server" Text='<%# Eval("Name")%>'></asp:TextBox>
                    <asp:RequiredFieldValidator ID="RFV_name" runat="server" Text="*" ErrorMessage="<%$ Resources: EPiServer, validation.formrequired %>" ControlToValidate="FrameName"></asp:RequiredFieldValidator>
                </EditItemTemplate>
            </asp:TemplateColumn>
            <asp:TemplateColumn HeaderText="<%$ Resources: EPiServer, admin.frames.tabledescription %>">
                <ItemTemplate>
                    <%# Server.HtmlEncode(Eval("Description") as string)%>
                </ItemTemplate>
                <EditItemTemplate>
                    <asp:TextBox SkinID="Small" ID="FrameDescription" CssClass="EP-requiredField" runat="server" Text='<%# Eval("Description")%>'></asp:TextBox>
                    <asp:RequiredFieldValidator ID="RFV_Description" runat="server" Text="*" ErrorMessage="<%$ Resources: EPiServer, validation.formrequired %>" ControlToValidate="FrameDescription"></asp:RequiredFieldValidator>
                </EditItemTemplate>
            </asp:TemplateColumn>
            <asp:TemplateColumn HeaderText="<%$ Resources: EPiServer, button.edit %>" ItemStyle-HorizontalAlign="Center">
                <ItemTemplate>
                    <EPiServerUI:ToolButton CommandName="Edit" runat="server" SkinID="Edit" Enabled="<%# ButtonEnabled( Container.ItemIndex )%>" ToolTip="<%$ Resources: EPiServer, button.edit %>" />
                </ItemTemplate>
                <EditItemTemplate>
                    <EPiServerUI:ToolButton DisablePageLeaveCheck="true" CommandName="Update" CausesValidation="true" runat="server" SkinID="Save" ToolTip="<%$ Resources: EPiServer, button.save %>" /><EPiServerUI:ToolButton DisablePageLeaveCheck="true" CommandName="Cancel" CausesValidation="false" runat="server" SkinID="Cancel" ToolTip="<%$ Resources: EPiServer, button.cancel %>" />
                </EditItemTemplate>
            </asp:TemplateColumn>
            <asp:TemplateColumn HeaderText="<%$ Resources: EPiServer, button.delete %>" ItemStyle-HorizontalAlign="Center">
                <ItemTemplate>
                    <EPiServerUI:ToolButton id="deleteTool" CommandName="Delete" runat="server" SkinID="Delete" EnableClientConfirm="true"  Enabled='<%# !(bool)Eval("IsSystemFrame") && ButtonEnabled( Container.ItemIndex )%>' ToolTip="<%$ Resources: EPiServer, button.delete %>" />
                    <EPiServerScript:ScriptSettings runat="server" TargetControlId="deleteTool" CommonSettingsControlId="deleteCommon" Name='<%# Eval("Name")%>' /> 
                </ItemTemplate>
                <EditItemTemplate>
                </EditItemTemplate>
            </asp:TemplateColumn>
        </Columns>
    </asp:DataGrid>
</asp:Content>
