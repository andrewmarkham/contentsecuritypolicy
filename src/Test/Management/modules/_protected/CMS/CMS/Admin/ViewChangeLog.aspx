<%@ Page Language="C#" AutoEventWireup="True" CodeBehind="ViewChangeLog.aspx.cs"
    Inherits="EPiServer.UI.Admin.ViewChangeLog" %>
<asp:content runat="server" contentplaceholderid="MainRegion">
    <script type="text/javascript">
        function validateLongInt() {
            var value = document.getElementById('StartSeqTextBox');
            var intVal = parseInt(value, 10);
            return intVal != NaN;
        }
	</script>
    <div class="epi-formArea">
        <div class="epi-size20">
            <div>
                <asp:Label AssociatedControlID="ChangeFromDate" runat="server" Translate="#changedatefrom" />
                <EPiServer:InputDate runat="server" ID="ChangeFromDate" DisplayTime="true" style="display: inline;" DisplayName="<%$ Resources: EPiServer, admin/viewchangelog/changedatefrom %>" ValidateInput="True" />
            </div>
            <div>
                <asp:Label AssociatedControlID="ChangeToDate" runat="server" Translate="#changedateto" />
                <EPiServer:InputDate runat="server" ID="ChangeToDate" DisplayTime="true" style="display: inline;" DisplayName="<%$ Resources: EPiServer, admin/viewchangelog/changedateto %>" ValidateInput="True" />
            </div>
            <div>
                <asp:Label AssociatedControlID="CategoryDropDown" runat="server" Translate="#category" />
                <asp:DropDownList ID="CategoryDropDown" runat="server" OnSelectedIndexChanged="CategoryDropDown_SelectedIndexChanged" AutoPostBack="true" />
            </div>
            <div>
                <asp:Label AssociatedControlID="ActionDropDown" runat="server" Translate="#action" />
                <asp:DropDownList ID="ActionDropDown" runat="server" />
            </div>
            <div>
                <asp:Label AssociatedControlID="ChangedByTextBox" runat="server" Translate="#changedby" />
                <asp:TextBox ID="ChangedByTextBox" runat="server" MaxLength="100" />
            </div>
            <div>
                <asp:Label AssociatedControlID="MaxItemsTextBox" runat="server" Translate="#maxitems" />
                <asp:TextBox ID="MaxItemsTextBox" runat="server" MaxLength="4" Width="100" />
                <asp:RangeValidator ID="MaxItemsRangeValidator" runat="server" ControlToValidate="MaxItemsTextBox" Type="Integer" MinimumValue="1" MaximumValue="9999" Display="Dynamic" Text="*" ErrorMessage="<%$ Resources: EPiServer, admin/viewchangelog/errormsgmaxitems %>" />
                <asp:RequiredFieldValidator runat="server" ControlToValidate="MaxItemsTextBox" Display="Dynamic" Text="*" ErrorMessage="<%$ Resources: EPiServer, admin/viewchangelog/errormsgmaxitems %>" />
            </div>
            <div>
                <asp:Label AssociatedControlID="StartSeqTextBox" runat="server" MaxLength="15" Translate="#startsequence" />
                <asp:TextBox ID="StartSeqTextBox" runat="server" MaxLength="19" Width="100" />
                <asp:CustomValidator id="StartSeqCustomValidator" runat="server" ControlToValidate="StartSeqTextBox" Text="*" ErrorMessage="<%$ Resources: EPiServer, admin/viewchangelog/errormsgstartsequence %>" OnServerValidate="StartSeq_Validate" ClientValidationFunction="validateLongInt" Display="Dynamic" />
            </div>
            <div>
                <asp:Label AssociatedControlID="ArchiveCheckBox" runat="server" Translate="#includearchive" />
                <asp:Checkbox ID="ArchiveCheckBox" runat="server" />
            </div>
            <div class="epi-indent">
                <EPiServerUI:ToolButton ID="ReadButton" OnClick="ReadButton_Click" runat="server" SkinID="Report" Text="<%$ Resources: EPiServer, admin/viewchangelog/read %>" ToolTip="<%$ Resources: EPiServer, admin/viewchangelog/read %>" />
            </div>
        </div>
    </div>

    <table class="epi-default epi-marginVertical" cellpadding="0">
        <tr>
            <th>
                <EPiServer:Translate runat="server" Text="#colheadingsequencenumber" />
            </th>
            <th>
                <EPiServer:Translate runat="server" Text="#colheadingchangedate" />
            </th>
            <th>
                <EPiServer:Translate runat="server" Text="#colheadingcategory" />
            </th>
            <th>
                <EPiServer:Translate runat="server" Text="#colheadingaction" />
            </th>
            <th>
                <EPiServer:Translate runat="server" Text="#colheadingChangedby" />
            </th>
            <th>
                <EPiServer:Translate runat="server" Text="#colheadingdata" />
            </th>
        </tr>
        <tbody>
        <asp:Repeater ID="DataRepeater" runat="server">
            <ItemTemplate>
                <tr>
                    <td>
                        <%# DataBinder.Eval(Container.DataItem, "ID") %>
                    </td>
                    <td>
                        <%# DataBinder.Eval(Container.DataItem, "Created") %>
                    </td>
                    <td>
                        <%# GetActivityTypeName(Container.DataItem) %>
                    </td>
                    <td>
                        <%# GetActionName(Container.DataItem) %>
                    </td>
                    <td>
                        <%#: DataBinder.Eval(Container.DataItem, "ChangedBy") %>
                    </td>
                    <td>
                        <%# GetExtendedData(Container.DataItem) %>
                    </td>
                </tr>
            </ItemTemplate>
        </asp:Repeater>
        </tbody>
    </table>
    <div>
        <EPiServerUI:ToolButton ID="PrevButton" OnClick="PrevButton_Click" runat="server" SkinID="ArrowLeft" Text="<%$ Resources: EPiServer, admin/viewchangelog/previous %>" ToolTip="<%$ Resources: EPiServer, admin/viewchangelog/previous %>" />
        <EPiServerUI:ToolButton ID="NextButton" OnClick="NextButton_Click" runat="server" SkinID="ArrowRight" Text="<%$ Resources: EPiServer, admin/viewchangelog/next %>" ToolTip="<%$ Resources: EPiServer, admin/viewchangelog/next %>" />
    </div>
</asp:content>
