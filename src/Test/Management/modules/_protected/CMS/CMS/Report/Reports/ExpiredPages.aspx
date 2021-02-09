<%@ Page Language="C#" AutoEventWireup="false" CodeBehind="ExpiredPages.aspx.cs" Inherits="EPiServer.UI.Report.Reports.ExpiredPages" %>
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
                    <label><asp:Literal runat="server" Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.expired %>" /></label>
                    <span class="epilinklist">
                        <asp:LinkButton OnCommand="SetTime_Click" CommandName="LastMonth" Text="<%$ Resources: EPiServer, button.lastmonth %>" runat="server" />
                        <asp:LinkButton OnCommand="SetTime_Click" CommandName="LastWeek" Text="<%$ Resources: EPiServer, button.lastweek %>" runat="server" />
                        <asp:LinkButton OnCommand="SetTime_Click" CommandName="ComingWeek" Text="<%$ Resources: EPiServer, button.comingweek %>" runat="server" />
                        <asp:LinkButton OnCommand="SetTime_Click" CommandName="ComingMonth" Text="<%$ Resources: EPiServer, button.comingmonth %>" runat="server" />
                    </span>
                </div>
                <div>
                    <asp:Label runat="server" Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.expiringbetween %>" AssociatedControlID="StartDate"/>
                    <EPiServer:InputDate ID="StartDate" CssClass="epiinlineinputcontrol" style="width:auto;" runat="server" />
                    ─
                    <EPiServer:InputDate ID="EndDate" CssClass="epiinlineinputcontrol" style="width:auto;" runat="server" />
                </div>
                <div>
                    <asp:Label runat="server" Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.selectrootpage %>" AssociatedControlID="StartPage" />
                    <EPiServer:InputPageReference CssClass="epiinlineinputcontrol" ID="StartPage" runat="server" PageLink="<%# EPiServer.Core.PageReference.StartPage %>"  DisableCurrentPageOption="true"/>
                </div>
                <div>
                    <asp:Label runat="server" Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.publishedbyme %>" AssociatedControlID="ChangedByCurrentUser" ></asp:Label>
                    <asp:CheckBox runat="server" ID="ChangedByCurrentUser" />
                </div>
                <div id="LanguageDiv" runat="server">
                    <asp:Label runat="server" Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.selectlanguage %>" AssociatedControlID="LanguageSelector" />
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
            <asp:Label runat="server" Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.numberofitemsperpage %>" AssociatedControlID="PageSizeSelector" />
            <asp:DropDownList SkinID="Custom" runat="server" ID="PageSizeSelector">
                <asp:ListItem Text="10" Value="10" Selected="True" />
                <asp:ListItem Text="25" Value="25" />
                <asp:ListItem Text="50" Value="50" />
                <asp:ListItem Text="100" Value="100"  />
            </asp:DropDownList><br />
        </div>
        <div class="epi-floatLeft epi-marginVertical-small"><asp:Literal ID="HitsCount" runat="server" /></div>

        <div class="epi-clear">
            <EPiServerUI:SortedGridView ID="ReportView" runat="server"
            DefaultSortExpression="StartPublish"
            DefaultSortDirection="Descending"
            Width="100%"
            AutoGenerateColumns="false"
            >
            <Columns>
                <asp:TemplateField HeaderText="<%$ Resources: EPiServer, reportcenter.reportcolumnheadings.pagename %>" ItemStyle-Width="15%" SortExpression="PageName">
                    <ItemTemplate >
                        <EPiServerUI:PageNameLink PageData='<%# (EPiServer.Core.PageData)Container.DataItem %>' runat="server" />
                    </ItemTemplate>
                </asp:TemplateField>
                <asp:TemplateField HeaderText="<%$ Resources: EPiServer, reportcenter.reportcolumnheadings.startpublish %>" SortExpression="StartPublish" >
                    <ItemTemplate>
                        <EPiServerUI:DateLabel Value='<%# Eval("StartPublish") ?? DateTime.MinValue%>' runat="server" />
                    </ItemTemplate>
                </asp:TemplateField>
                <asp:TemplateField HeaderText="<%$ Resources: EPiServer, reportcenter.reportcolumnheadings.stoppublish %>" SortExpression="StopPublish">
                    <ItemTemplate>
                        <EPiServerUI:DateLabel Value='<%# Eval("StopPublish") ?? DateTime.MinValue %>' runat="server" />
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

    <asp:ObjectDataSource ID="ExpiredReportData" runat="server" SortParameterName="sortExpression"
        TypeName="EPiServer.UI.Report.Reports.ExpiredPagesData" OnObjectCreating="ReportData_ObjectCreating"
        SelectMethod="GetPages" SelectCountMethod="GetRowCount" EnablePaging="true"
        OnSelected="ReportData_Selected">
        <SelectParameters>
            <asp:ControlParameter ControlID="__Page" Direction="Input" PropertyName="SelectedRootPage" Name="startPage" />
            <asp:ControlParameter ControlID="__Page" Direction="Input" PropertyName="StartDateValue" Name="startDate" />
            <asp:ControlParameter ControlID="__Page" Direction="Input" PropertyName="StopDateValue" Name="endDate" />
            <asp:ControlParameter ControlID="__Page" Direction="Input" PropertyName="LanguageId" Name="languageId" />
            <asp:ControlParameter ControlID="__Page" Direction="Input" PropertyName="CurrentUserChecked" Name="publishedByMe" />
            <asp:Parameter Direction="Output" Name="rowCount" DefaultValue="0"/>
        </SelectParameters>
    </asp:ObjectDataSource>

</asp:Content>

