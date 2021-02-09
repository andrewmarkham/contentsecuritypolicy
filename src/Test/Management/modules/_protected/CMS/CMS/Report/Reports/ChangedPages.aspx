<%@ Page Language="C#" AutoEventWireup="false" CodeBehind="ChangedPages.aspx.cs" Inherits="EPiServer.UI.Report.Reports.ChangedPages" %>
<%@ Register TagPrefix="EPiServerUI" TagName="DateLabel" Src="DateLabel.ascx" %>
<%@ Register TagPrefix="EPiServerUI" TagName="PageNameLink" Src="PageNameLink.ascx" %>
<%@ Register TagPrefix="EPiServerUI" Namespace="EPiServer.UI.Report.Reports" Assembly="EPiServer.UI" %>

<asp:Content ContentPlaceHolderID="MainRegion" runat="server">
    <div class="epi-formArea">
        <fieldset>
            <legend>
                <asp:Literal Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.heading %>" runat="server"/>
            </legend>
            <div class="epi-size10">
                <div>
                    <asp:label runat="server" Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.changed %>" AssociatedControlID="TimePeriod" />
                    <asp:Panel ID="Quicklinks" CssClass="epilinklist" style="display:inline;" runat="server">
                        <asp:LinkButton OnCommand="SetTime_Click" CommandName="LastMonth" Text="<%$ Resources: EPiServer, button.lastmonth %>" runat="server" />
                        <asp:LinkButton OnCommand="SetTime_Click" CommandName="LastWeek" Text="<%$ Resources: EPiServer, button.lastweek %>" runat="server" />
                        <asp:LinkButton OnCommand="SetTime_Click" CommandName="Yesterday" Text="<%$ Resources: EPiServer, button.yesterday %>" runat="server" />
                        <asp:LinkButton OnCommand="SetTime_Click" CommandName="Today" Text="<%$ Resources: EPiServer, button.today %>" runat="server" />
                    </asp:Panel>
                </div>
                <div class="epi-indent">
                    <asp:DropDownList SkinId="Custom" runat="server" ID="TimePeriod" AutoPostBack="true" OnSelectedIndexChanged="TimePeriod_Changed">
                        <asp:ListItem Value="Before" Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.before %>" />
                        <asp:ListItem Selected="True" Value="Between" Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.between %>" />
                        <asp:ListItem Value="After" Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.after %>" />
                    </asp:DropDownList>
                    <EPiServer:InputDate style="width: auto;" CssClass="epiinlineinputcontrol" ID="StartDateSelector" runat="server" />
                    <asp:Literal runat="server" ID="DateDash" Text="─" />
                    <EPiServer:InputDate style="width: auto;" CssClass="epiinlineinputcontrol" ID="EndDateSelector" runat="server" />
                </div>
                <div>
                    <asp:label runat="server" Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.selectrootpage %>" AssociatedControlID="StartPageSelector" />
                    <EPiServer:InputPageReference CssClass="epiinlineinputcontrol" ID="StartPageSelector" runat="server" DisableCurrentPageOption="true"/>
                </div>
                <div>
                    <asp:Label runat="server" Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.changedbyme %>" AssociatedControlID="ChangedByCurrentUser" />
                    <asp:CheckBox runat="server" ID="ChangedByCurrentUser" Checked="false" />
                </div>
                <div ID="LanguageSelectionContainer" runat="server">
                    <asp:label runat="server" Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.selectlanguage %>" AssociatedControlID="LanguageSelector" />
                    <asp:DropDownList runat="server" ID="LanguageSelector" AppendDataBoundItems="true" DataTextField="Name" DataValueField="LanguageID">
                        <asp:ListItem Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.all %>" Value="" Selected="True" />
                    </asp:DropDownList>
                </div>
            </div>
        </fieldset>

        <div class="epitoolbuttonrow">
            <EPiServerUI:ToolButton runat="server" SkinID="Report" Text="<%$ Resources: EPiServer, button.showreport %>" OnClick="ShowReport_Click" />
        </div>

        <div class="epi-floatRight epi-marginVertical-small">
            <asp:label runat="server" Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.numberofitemsperpage %>" AssociatedControlID="PageSizeSelector" />
            <asp:DropDownList runat="server" SkinId="Custom" ID="PageSizeSelector">
                <asp:ListItem Text="10" Value="10" Selected="true" />
                <asp:ListItem Text="25" Value="25" />
                <asp:ListItem Text="50" Value="50" />
                <asp:ListItem Text="100" Value="100" />
            </asp:DropDownList>
        </div>
        <div class="epi-floatLeft epi-marginVertical-small"><asp:Literal ID="HitsCount" runat="server" /></div>

        <div class="epi-contentArea epi-clear">
        <EPiServerUI:SortedGridView ID="ReportView" runat="server"
            AutoGenerateColumns="false"
            DefaultSortDirection="Ascending" DefaultSortExpression="Saved"
            Width="100%"
            >
            <Columns>
                <asp:TemplateField HeaderText="<%$ Resources: EPiServer, reportcenter.reportcolumnheadings.pagename %>" ItemStyle-Width="27%" SortExpression="PageName">
                    <ItemTemplate >
                       <EPiServerUI:PageNameLink PageData='<%# (EPiServer.Core.PageData)Container.DataItem %>' runat="server" />
                    </ItemTemplate>
                </asp:TemplateField>
                <asp:TemplateField HeaderText="<%$ Resources: EPiServer, reportcenter.reportcolumnheadings.modified %>" SortExpression="Saved" >
                    <ItemTemplate>
                        <EPiServerUI:DateLabel Value='<%# Eval("Saved") %>' runat="server" />
                    </ItemTemplate>
                </asp:TemplateField>
                <EPiServerUI:NaiveBoundField DataField="ChangedBy" HeaderText="<%$ Resources: EPiServer, reportcenter.reportcolumnheadings.modifiedby %>" SortExpression="ChangedBy" />
                <EPiServerUI:NaiveBoundField DataField="LanguageID" HeaderText="<%$ Resources: EPiServer, reportcenter.reportcolumnheadings.language %>" SortExpression="Language" />
                <EPiServerUI:NaiveBoundField DataField="PageTypeName" HeaderText="<%$ Resources: EPiServer, reportcenter.reportcolumnheadings.pagetypename %>" SortExpression="PageTypeName" />
            </Columns>
            <PagerSettings Mode="NumericFirstLast" />
        </EPiServerUI:SortedGridView>
        </div>
    </div>

    <asp:ObjectDataSource ID="ChangedReport" runat="server" SortParameterName="sortExpression"
        TypeName="EPiServer.UI.Report.Reports.ChangedPagesData"
        SelectMethod="GetPages" SelectCountMethod="GetRowCount" EnablePaging="true"
        OnSelected="ReportData_Selected" OnObjectCreating="ReportData_ObjectCreating">
        <SelectParameters>
            <asp:ControlParameter ControlID="__Page" Direction="Input" Type="Object" PropertyName="RootPage" Name="startPage" />
            <asp:ControlParameter ControlID="__Page" Direction="Input" Type="String" PropertyName="LanguageId" Name="languageId" />
            <asp:ControlParameter ControlID="__Page" Direction="Input" Type="Boolean" PropertyName="IsChangedByCurrentUser" Name="isChangedByCurrentUser" />
            <asp:ControlParameter ControlID="__Page" Direction="Input" PropertyName="StartDate" Name="startDate" />
            <asp:ControlParameter ControlID="__Page" Direction="Input" PropertyName="EndDate" Name="stopDate" />
            <asp:Parameter Direction="Output" Name="rowCount" DefaultValue="0"/>
        </SelectParameters>
    </asp:ObjectDataSource>

</asp:Content>

