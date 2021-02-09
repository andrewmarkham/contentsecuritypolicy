<%@ Page Language="c#" CodeBehind="Categories.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.Categories"
     Title="Edit Categories" %>
<%@ Import Namespace="EPiServer.DataAbstraction"%>

<asp:Content ContentPlaceHolderID="MainRegion" runat="server">
    <div class="epi-buttonDefault">
        <EPiServerUI:ToolButton ID="AddRootCategory" OnClick="InsertRootCategory" SkinID="Add"
            Text="<%$ Resources: EPiServer, button.add %>" ToolTip="<%$ Resources: EPiServer, button.add %>"
            runat="server" />
    </div>
    <asp:DataGrid ID="Grid" runat="server" AutoGenerateColumns="false" OnPreRender="PreRendering"
        OnDataBinding="SetHeaders" DataKeyField="ID" OnEditCommand="Edit_Clicked" OnCancelCommand="CancelEditing"
        OnUpdateCommand="Save_Click" OnDeleteCommand="DeleteCategory" OnItemCommand="HandleButtons"
        UseAccessibleHeader="true">
        <Columns>
            <asp:TemplateColumn>
                <ItemStyle CssClass="nowrap"/>
                <ItemTemplate>
                    <div style="padding-left: <%# (((Category)Container.DataItem).Indent - 1) * 15 %>px">
                        <%# HttpUtility.HtmlEncode(DataBinder.Eval(Container.DataItem, "Name").ToString()) %>
                    </div>
                </ItemTemplate>
                <EditItemTemplate>
                    <div style="padding-left: <%# (((Category)Container.DataItem).Indent - 1) * 15 %>px">
                        <asp:TextBox ID="CategoryName" CssClass="EP-requiredField" SkinID="Size140" runat="server" Text='<%#DataBinder.Eval(Container.DataItem, "Name")%>'></asp:TextBox>&nbsp;
                        <EPiServerScript:ScriptSetFocusEvent FocusControlID="CategoryName" EventTargetClientNode="window" EventType="Load" runat="server" />
                        <asp:RequiredFieldValidator ID="CategoryNameValidator" runat="server" ControlToValidate="CategoryName"
                            Text="*" />
                        <asp:CustomValidator ID="UniqueNameValidator" runat="server" ControlToValidate="CategoryName"
                            OnServerValidate="UniqueNameValidator_Validate" Text="*" />
                            <asp:RegularExpressionValidator ID="NonNumberValidator" runat="server" ControlToValidate="CategoryName" Text="*" 
                            ValidationExpression="^[^\d\+\-].*" />
                    </div>
                </EditItemTemplate>
            </asp:TemplateColumn>
            <asp:TemplateColumn>
                <ItemStyle CssClass="nowrap" />
                <ItemTemplate>
                    <%# HttpUtility.HtmlEncode(DataBinder.Eval(Container.DataItem, "Description").ToString()) %>
                </ItemTemplate>
                <EditItemTemplate>
                    <asp:TextBox Columns="10" CssClass="EP-requiredField" ID="CategoryDescription" SkinID="Size200" runat="server"
                        Text='<%#DataBinder.Eval(Container.DataItem, "Description")%>'></asp:TextBox>&nbsp;
                    <asp:RequiredFieldValidator ID="CategoryDescriptionValidator" runat="server" ControlToValidate="CategoryDescription"
                        Text="*" />
                </EditItemTemplate>
            </asp:TemplateColumn>
            <asp:TemplateColumn>
                <ItemTemplate>
                    <%#(bool)DataBinder.Eval(Container.DataItem, "Available") ? "<img src='" + this.GetImageThemeUrl("Tools/CheckBoxOn.gif") + "' alt='" + 
                    Translate("/admin/categories/tablevisible") + "'>" : "<img src='" + this.GetImageThemeUrl("Tools/CheckBoxOff.gif") + 
                    "' alt='" + Translate("/admin/categories/notvisible") + "'>"%>
                </ItemTemplate>
                <EditItemTemplate>
                    <asp:CheckBox runat="server" Checked='<%#(bool)DataBinder.Eval(Container.DataItem, "Available") ? true : false%>'>
                    </asp:CheckBox>
                </EditItemTemplate>
            </asp:TemplateColumn>
            <asp:TemplateColumn>
                <ItemTemplate>
                    <%#(bool)DataBinder.Eval(Container.DataItem, "Selectable") ? "<img src='" + this.GetImageThemeUrl("Tools/CheckBoxOn.gif") + 
                    "' alt='" + Translate("/admin/categories/tableselectable") + "'>" : 
                    "<img src='" + this.GetImageThemeUrl("Tools/CheckBoxOff.gif") + 
                    "' alt='" + Translate("/admin/categories/notselectable") + "'>"%>
                </ItemTemplate>
                <EditItemTemplate>
                    <asp:CheckBox runat="server" Checked='<%#(bool)DataBinder.Eval(Container.DataItem, "Selectable") ? true : false%>'>
                    </asp:CheckBox>
                </EditItemTemplate>
            </asp:TemplateColumn>
        </Columns>
    </asp:DataGrid>
</asp:Content>
