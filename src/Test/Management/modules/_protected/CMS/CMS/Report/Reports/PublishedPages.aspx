<%@ Page Language="C#" AutoEventWireup="false" CodeBehind="PublishedPages.aspx.cs" Inherits="EPiServer.UI.Report.Reports.PublishedPages" %>
<%@ Import Namespace="EPiServer.Core" %>
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
                <label>
                    <asp:Literal runat="server" Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.published %>" /></label>
                    <span class="epilinklist">
                        <asp:LinkButton OnCommand="SetTime_Click" CommandName="LastMonth" Text="<%$ Resources: EPiServer, button.lastmonth %>" runat="server" />
                        <asp:LinkButton OnCommand="SetTime_Click" CommandName="LastWeek" Text="<%$ Resources: EPiServer, button.lastweek %>" runat="server" />
                        <asp:LinkButton OnCommand="SetTime_Click" CommandName="Yesterday" Text="<%$ Resources: EPiServer, button.yesterday %>" runat="server" />
                        <asp:LinkButton OnCommand="SetTime_Click" CommandName="Today" Text="<%$ Resources: EPiServer, button.today %>" runat="server" />
                    </span>
                </div>
                <div>
                    <asp:label runat="server" Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.publishedbetween %>" AssociatedControlID="StartDate" />
                    <EPiServer:InputDate ID="StartDate" CssClass="epiinlineinputcontrol" style="width:auto;" runat="server" />
                    ─
                    <EPiServer:InputDate ID="EndDate" CssClass="epiinlineinputcontrol" style="width:auto;" runat="server" />
                </div>
                <div>
                    <asp:label runat="server" Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.selectrootpage %>" AssociatedControlID="StartPage" />
                    <EPiServer:InputPageReference CssClass="epiinlineinputcontrol" ID="StartPage" runat="server" DisableCurrentPageOption="true"/>
                </div>
                <div>
                    <asp:Label runat="server" AssociatedControlID="ChangedByCurrentUser" Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.publishedbyme %>" />
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
            <asp:DropDownList SkinID="Custom" runat="server" ID="PageSizeSelector">
                <asp:ListItem Text="10" Value="10" Selected="true" />
                <asp:ListItem Text="25" Value="25" />
                <asp:ListItem Text="50" Value="50" />
                <asp:ListItem Text="100" Value="100" />
            </asp:DropDownList>
        </div>
        <div class="epi-floatLeft epi-marginVertical-small"><asp:Literal ID="HitsCount" runat="server" /></div>

        <div class="epi-clear">
            <EPiServerUI:SortedGridView ID="ReportView" runat="server"
            AutoGenerateColumns="false"
            DefaultSortDirection="Ascending" DefaultSortExpression="StartPublish"
            Width="100%"
            >
            <Columns>
                <asp:TemplateField HeaderText="<%$ Resources: EPiServer, reportcenter.reportcolumnheadings.pagename %>" ItemStyle-Width="22%" SortExpression="PageName">
                    <ItemTemplate>
                        <EPiServerUI:PageNameLink PageData='<%# (EPiServer.Core.PageData)Container.DataItem %>' runat="server" />
                    </ItemTemplate>
                </asp:TemplateField>
                <asp:TemplateField HeaderText="<%$ Resources: EPiServer, reportcenter.reportcolumnheadings.startpublish %>" SortExpression="StartPublish">
                    <ItemTemplate>
                        <EPiServerUI:DateLabel Value='<%# Eval("StartPublish") ?? DateTime.MinValue  %>' runat="server" />
                    </ItemTemplate>
                </asp:TemplateField>
                <asp:TemplateField HeaderText="<%$ Resources: EPiServer, reportcenter.reportcolumnheadings.stoppublish %>" SortExpression="StopPublish" >
                    <ItemTemplate>
                        <EPiServerUI:DateLabel Value='<%# Eval("StopPublish") ?? DateTime.MinValue%>' runat="server" />
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

    <asp:ObjectDataSource ID="ReportData" runat="server" SortParameterName="sortExpression"
        TypeName="EPiServer.UI.Report.Reports.PublishedPagesData"
        SelectMethod="GetPages" SelectCountMethod="GetRowCount" EnablePaging="true"
        OnSelected="ReportData_Selected" OnObjectCreating="ReportData_ObjectCreating">
        <SelectParameters>
            <asp:ControlParameter ControlID="__Page" Direction="Input" PropertyName="SelectedRootPage" Name="startPage" />
            <asp:ControlParameter ControlID="__Page" Direction="Input" PropertyName="StartDateValue" Name="startDate" />
            <asp:ControlParameter ControlID="__Page" Direction="Input" PropertyName="StopDateValue" Name="stopDate" />
            <asp:ControlParameter ControlID="__Page" Direction="Input" PropertyName="LanguageId" Name="languageId" />
            <asp:ControlParameter ControlID="__Page" Direction="Input" PropertyName="CurrentUserChecked" Name="changedByCurrentUser" />
            <asp:Parameter Direction="Output" Name="rowCount" DefaultValue="0"/>
        </SelectParameters>
    </asp:ObjectDataSource>

</asp:Content>

